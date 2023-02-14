import { communityState } from '@/atoms/communitiesAtom';
import { Post, postSate, PostVote } from '@/atoms/postsAtom';
import { auth, firestore, storage } from '@/firebase/clientApp';
import { collection, deleteDoc, doc, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import React, { useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRecoilState, useRecoilValue } from 'recoil';


const usePosts = () => {

    const [user] = useAuthState(auth);

    const [postStateValue, setPostStateValue] = useRecoilState(postSate)

    const currentCommunity = useRecoilValue(communityState).currentCommunity;

    const onVote = async (post: Post, vote: number, communityId: string) => {

        // Check for a logged in user => if not, open auth modal

        try {

            const { voteStatus } = post;
            const existingVote = postStateValue.postVotes.find(
                (vote) => vote.postId === post.id
            );

            const batch = writeBatch(firestore);
            const updatedPost = { ...post }
            const updatedPosts = [...postStateValue.posts];
            let updatedPostVotes = [...postStateValue.postVotes]
            let voteChange = vote;


            // Check if postVotes document don't exit in the database - new vote
            if (!existingVote) {
                // create a new postVote document
                const postVoteRef = doc(
                    collection(firestore, "users", `${user?.uid}/postVotes`)
                );

                console.log('postVotes ref', postVoteRef);


                const newVote: PostVote = {
                    id: postVoteRef.id,
                    postId: post.id!,
                    communityId,
                    voteValue: vote, //1 or -1
                }

                console.log('NEW VOTE !!!', newVote);


                batch.set(postVoteRef, newVote);

                // add/substract 1 to/from post.voteStatus
                updatedPost.voteStatus = voteStatus + vote;
                updatedPostVotes = [...updatedPostVotes, newVote];

            }
            // Exiting vote - user have voted on this post before
            else {

                const postVoteRef = doc(
                    firestore, 'users', `${user?.uid}/postVotes/${existingVote.id}`
                )

                //Removing a vote (up => neutral OR down => neutral)
                if (existingVote.voteValue === vote) {

                    // add/substract 1 to/from post.voteStatus
                    updatedPost.voteStatus = voteStatus - vote;
                    updatedPostVotes = updatedPostVotes.filter(
                        (vote) => vote.id !== existingVote.id
                    )

                    // delete postVote document
                    batch.delete(postVoteRef);

                    voteChange *= -1;

                }
                // Flipping their vote (up => down OR down => up)
                else {

                    // add/substract 2 to/from post.voteStatus
                    updatedPost.voteStatus = voteStatus + 2 * vote

                    const voteIdx = postStateValue.postVotes.findIndex(
                        (vote) => vote.id === existingVote.id
                    );

                    updatedPostVotes[voteIdx] = {
                        ...existingVote,
                        voteValue: vote,
                    };

                    // Update existing postVote document in the database
                    batch.update(postVoteRef, {
                        voteValue: vote,
                    });

                }
            }

            // update our post document
            const postRef = doc(firestore, 'posts', post.id!);
            batch.update(postRef, {
                voteStatus: voteStatus + voteChange
            });

            await batch.commit();

            //Update state with updated values 
            const postIdx = postStateValue.posts.findIndex(
                (item) => item.id === post.id
            );
            updatedPosts[postIdx] = updatedPost;
            setPostStateValue((prev) => ({
                ...prev,
                posts: updatedPosts,
                postVotes: updatedPostVotes,
            }));

        } catch (error: any) {
            console.log('onVote error', error.message);
        }
    }

    const onSelectPost = () => { }

    const onDeletePost = async (post: Post): Promise<Boolean> => {
        try {
            // check if there is an image, delete if exist
            if (post.imageURL) {
                const imageRef = ref(storage, `posts/${post.id}/image`);
                await deleteObject(imageRef);
            }
            // delete post document in firebase
            const postDocRef = doc(firestore, 'posts', post.id!);
            await deleteDoc(postDocRef);
            // update recoil state
            setPostStateValue((prev) => ({
                ...prev,
                posts: prev.posts.filter(item => item.id !== post.id)
            }))
            return true
        } catch (error) {
            return false
        }
    }

    // get current community postVotes and store in recoil state for client
    const getCommunityPostVotes = async (communityId: string) => {
        const postVotesQuery = query(
            collection(firestore, "users", `${user?.uid}/postVotes`),
            where("communityId", "==", communityId)
        );

        const postVoteDocs = await getDocs(postVotesQuery);
        const postVotes = postVoteDocs.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        setPostStateValue(prev => ({
            ...prev,
            postVotes: postVotes as PostVote[],
        }));
    }

    useEffect(() => {
        if (!user || !currentCommunity?.id) return
        getCommunityPostVotes(currentCommunity?.id)
    }, [user, currentCommunity]);

    return {
        postStateValue,
        setPostStateValue,
        onVote,
        onDeletePost,
        onSelectPost,
    }
}
export default usePosts;