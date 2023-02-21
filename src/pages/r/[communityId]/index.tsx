import { Community, communityState } from '@/atoms/communitiesAtom';
import About from '@/components/Community/About';
import CreatePostLink from '@/components/Community/CreatePostLink';
import Header from '@/components/Community/Header';
import NotFound from '@/components/Community/NotFound';
import PageContent from '@/components/Layout/PageContent';
import Posts from '@/components/Posts/Posts';
import { auth, firestore } from '@/firebase/clientApp';
import useCommunityData from '@/hooks/useCommunityData';
import { doc, getDoc } from 'firebase/firestore';
import { GetServerSidePropsContext } from 'next';
import React, { useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useSetRecoilState } from 'recoil';
import safeJsonStringify from 'safe-json-stringify'

type communityPageProps = {
    communityData: Community;
};

const communityPage: React.FC<communityPageProps> = ({ communityData }) => {

    const [user] = useAuthState(auth);

    const setCommunityStateValue = useSetRecoilState(communityState);

    const { communityStateValue } = useCommunityData();

    const isJoined = !!communityStateValue.mySnippets.find(
        (item) => item.communityId === communityData.id
    )



    useEffect(() => {
        setCommunityStateValue((prev) => ({
            ...prev,
            currentCommunity: communityData
        }))
    }, [communityData])

    if (!communityData) {
        return <NotFound />
    }
    return (
        <>
            <Header communityData={communityData} />
            <PageContent>
                <>
                    {isJoined && <CreatePostLink />}
                    <Posts communityData={communityData} />
                </>
                <>
                    <About communityData={communityData} />
                </>
            </PageContent>
        </>
    )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {

    //get community data and pass it to client
    try {
        const communityDocRef = doc(
            firestore, 'communities', context.query.communityId as string
        )
        const communityDoc = await getDoc(communityDocRef);
        return {
            props: {
                communityData: communityDoc.exists() ? JSON.parse(
                    safeJsonStringify({ id: communityDoc.id, ...communityDoc.data() })
                )
                    : "",
            },
        }
    } catch (error) {
        //add error page here
        console.log('getServerSideProps error', error);
        return (
            <NotFound />
        )
    }

}

export default communityPage;