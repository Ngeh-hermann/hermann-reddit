import { Community } from '@/atoms/communitiesAtom';
import CreatePostLink from '@/components/Community/CreatePostLink';
import Header from '@/components/Community/Header';
import NotFound from '@/components/Community/NotFound';
import PageContent from '@/components/Layout/PageContent';
import Posts from '@/components/Posts/Posts';
import { firestore } from '@/firebase/clientApp';
import { doc, getDoc } from 'firebase/firestore';
import { GetServerSidePropsContext } from 'next';
import React from 'react';
import safeJsonStringify from 'safe-json-stringify'

type communityPageProps = {
    communityData: Community;
};

const communityPage: React.FC<communityPageProps> = ({ communityData }) => {
    console.log('here is the community data', communityData);

    if (!communityData) {
        return <NotFound />
    }

    return (
        <>
            <Header communityData={communityData} />
            <PageContent>
                <>
                    <CreatePostLink />
                    <Posts communityData={communityData} />
                </>
                <><div>right side</div></>
            </PageContent>
        </>
    )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {

    //get com data and pass it to client
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
    }

}

export default communityPage;