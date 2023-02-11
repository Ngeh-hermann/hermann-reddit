import { Post, postSate } from '@/atoms/postsAtom';
import { firestore, storage } from '@/firebase/clientApp';
import { deleteDoc, doc } from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import React from 'react';
import { useRecoilState } from 'recoil';


const usePosts = () => {

    const [postStateValue, setPostStateValue] = useRecoilState(postSate)

    const onVote = async () => { }

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

    return {
        postStateValue,
        setPostStateValue,
        onVote,
        onDeletePost,
        onSelectPost,
    }
}
export default usePosts;