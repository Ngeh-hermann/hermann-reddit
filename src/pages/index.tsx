import { Post, PostVote } from '@/atoms/postsAtom';
import CreatePostLink from '@/components/Community/CreatePostLink';
import PersonalHome from '@/components/Community/PersonalHome';
import Premium from '@/components/Community/Premium';
import Recommendations from '@/components/Community/Recommendations';
import PageContent from '@/components/Layout/PageContent';
import PostItem from '@/components/Posts/PostItem';
import PostLoader from '@/components/Posts/PostLoader';
import { auth, firestore } from '@/firebase/clientApp';
import useCommunityData from '@/hooks/useCommunityData';
import usePosts from '@/hooks/usePosts';
import { Button, Stack } from '@chakra-ui/react';
import { collection, getCountFromServer, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';


const Home: NextPage = () => {
  const [user, loadingUser] = useAuthState(auth);
  const [loading, setLoading] = useState(false);
  const [loadMore, setLoadmore] = useState(false);
  const { postStateValue, setPostStateValue, onSelectPost, onDeletePost, onVote } = usePosts();
  const { communityStateValue } = useCommunityData();


  const buildUserHomeFeed = async () => {
    setLoading(true)
    try {
      if (communityStateValue.mySnippets.length) {
        // get posts from users communities
        const myCommunityIds = communityStateValue.mySnippets.map(
          (snippet) => snippet.communityId
        );

        const postQuery = query(
          collection(firestore, 'posts'),
          where('communityId', 'in', myCommunityIds),
          limit(50)
        );

        const numberOfposts = await getCountFromServer(postQuery);

        // const postDocs = await getDocs(postQuery);
        console.log('Number of posts of user communities', numberOfposts.data().count);

        if (numberOfposts.data().count < 5 && user) {
          console.log('enter if statement');
          setLoadmore(true)

          // const postQuery = query(
          //   collection(firestore, 'posts'),
          //   where('voteStatus', '>', 0), //change number of voteStatus
          //   // where('communityId', 'in', myCommunityIds),
          //   orderBy('voteStatus', 'desc'),
          //   orderBy('createdAt', 'desc'),
          //   limit(50)
          // );
          // const postDocs = await getDocs(postQuery);
          // const posts = postDocs.docs.map((doc) => ({
          //   id: doc.id,
          //   ...doc.data(),
          // }));

          // setPostStateValue((prev) => ({
          //   ...prev,
          //   posts: posts as Post[],
          // }));
          buildNoUserHomeFeed();
        } else {
          console.log('not enter if');

          const postDocs = await getDocs(postQuery);
          const posts = postDocs.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setPostStateValue((prev) => ({
            ...prev,
            posts: posts as Post[],
          }));
        }

      }
      else {
        buildNoUserHomeFeed();
      }

    } catch (error: any) {
      console.log('buildUserHomeFeed error', error.message);

    }
    setLoading(false)
  }

  const buildNoUserHomeFeed = async () => {
    setLoading(true)
    try {

      const postQuery = query(
        collection(firestore, 'posts'),
        orderBy('voteStatus', 'desc'),
        limit(50)
      );

      const postDocs = await getDocs(postQuery);

      const posts = postDocs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setPostStateValue((prev) => ({
        ...prev,
        posts: posts as Post[],
      }));

    } catch (error: any) {
      console.log('buildNoUserHomeFeed error', error.message);

    }
    setLoading(false)
  }

  const getUserPostVotes = async () => {
    try {
      const postIds = postStateValue.posts.map((post) => post.id);

      const postVoteQuery = query(
        collection(firestore, `users/${user?.uid}/postVotes`),
        where('postId', 'in', postIds)
      );

      const postVoteDocs = await getDocs(postVoteQuery);

      const postVotes = postVoteDocs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      setPostStateValue((prev) => ({
        ...prev,
        postVotes: postVotes as PostVote[],
      }))

    } catch (error: any) {
      console.log('getUserPostVotes error', error.message);

    }
  }

  // useEffect
  useEffect(() => {

    if (communityStateValue.snippetsFetched) buildUserHomeFeed();

  }, [communityStateValue.snippetsFetched])


  useEffect(() => {

    if (!user && !loadingUser) buildNoUserHomeFeed();

  }, [user, loadingUser])

  useEffect(() => {

    if (user && postStateValue.posts.length) getUserPostVotes();

    return () => {
      setPostStateValue((prev) => ({
        ...prev,
        postVotes: []
      }))
    }

  }, [user, postStateValue.posts])

  return (
    <PageContent>
      <>
        <CreatePostLink />
        {loading ? (
          <PostLoader />
        ) : (
          <Stack>
            {postStateValue.posts.map((post) => (
              <PostItem
                key={post.id}
                post={post}
                onSelectPost={onSelectPost}
                onDeletePost={onDeletePost}
                onVote={onVote}
                userVoteValue={postStateValue.postVotes.find(
                  (item) => item.postId === post.id)?.voteValue
                }
                userIsCreator={user?.uid === post.creatorId}
                homePage
              />
            ))}
            {loadMore && <Button onClick={() => { }}>Load more post</Button>}
          </Stack>

        )}
      </>
      <Stack spacing={5}>
        <PersonalHome />
        <Premium />
        <Recommendations />
      </Stack>
    </PageContent>
  )
}
export default Home;