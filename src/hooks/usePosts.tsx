import { postSate } from '@/atoms/postsAtom';
import React from 'react';
import { useRecoilState } from 'recoil';


const usePosts = () => {

    const [postStateValue, setPostStateValue] = useRecoilState(postSate)

    const onVote = async () => { }

    const onSelectPost = () => { }

    const onDeletePost = async () => { }

    return {
        postStateValue,
        setPostStateValue,
        onVote,
        onDeletePost,
        onSelectPost,
    }
}
export default usePosts;