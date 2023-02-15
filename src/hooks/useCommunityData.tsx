import { AuthModalState } from '@/atoms/authModalAtom';
import { Community, communitySnippets, communityState } from '@/atoms/communitiesAtom';
import { auth, firestore } from '@/firebase/clientApp';
import { collection, doc, getDoc, getDocs, increment, writeBatch } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRecoilState, useSetRecoilState } from 'recoil';


const useCommunityData = () => {

    const [user] = useAuthState(auth)
    const router = useRouter()

    const [communityStateValue, setCommunityStateValue] = useRecoilState(communityState);

    const setAuthModalState = useSetRecoilState(AuthModalState)

    const [loading, setLoading] = useState(false)

    const onJoinOrLeaveCommunity = (communityData: Community, isJoined: boolean) => {
        // is the user signed in ?
        // if not open auth modal 
        if (!user) {
            //open modal
            setAuthModalState({ open: true, view: "login" })
            return
        }

        // if (user.uid === communityData.creatorId) {
        //     isJoined = true;
        //     return
        // }

        if (isJoined) {
            leaveCommunity(communityData.id)
            return;
        }
        joinCommunity(communityData)
    }

    const getMySnippets = async () => {
        setLoading(true)
        try {
            //get user snippets
            const snippetsDocs = await getDocs(
                collection(firestore, `users/${user?.uid}/communitySnippets`)
            );

            const snippets = snippetsDocs.docs.map(doc => ({ ...doc.data() }))
            setCommunityStateValue(prev => ({
                ...prev,
                mySnippets: snippets as communitySnippets[]
            }))

        } catch (error: any) {
            console.log('getMySnippets error', error.message);
            // setError(error.message)

        }
        setLoading(false)
    }

    const joinCommunity = async (communityData: Community) => {
        setLoading(true)

        try {
            //create a new communitySnippets
            const batch = writeBatch(firestore)
            const newSnippets: communitySnippets = {
                communityId: communityData.id,
                imageURL: communityData.imageURL || "",
            }

            batch.set(
                doc(firestore,
                    `users/${user?.uid}/communitySnippets`, communityData.id
                ),
                newSnippets
            )

            //update number of members (+1)
            batch.update(doc(firestore, 'communities', communityData.id), {
                numberOfMembers: increment(1),
            })

            await batch.commit();

            //update recoil state ie communityState.mysnippets
            setCommunityStateValue(prev => ({
                ...prev,
                mySnippets: [...prev.mySnippets, newSnippets]
            }))

        } catch (error: any) {
            console.log('joinCommunity error', error.message);
            // setError(error.message)

        }
        setLoading(false)
    }

    const leaveCommunity = async (communityId: string) => {
        setLoading(true)



        try {
            const batch = writeBatch(firestore)

            //delete communitySnippets
            batch.delete(
                doc(firestore, `users/${user?.uid}/communitySnippets`, communityId)
            )

            //update number of members (-1)
            batch.update(doc(firestore, 'communities', communityId), {
                numberOfMembers: increment(-1),
            })

            await batch.commit()

            //update recoil state ie communityState.mysnippets
            setCommunityStateValue((prev) => ({
                ...prev,
                mySnippets: prev.mySnippets.filter(
                    item => item.communityId !== communityId
                )
            }))

        } catch (error: any) {
            console.log('leaveCommunity error', error.message);
        }
        setLoading(false)
    }

    const getCommunityData = async (communityId: string) => {
        try {

            const communityDocRef = doc(firestore, "communities", communityId);
            const communityDoc = await getDoc(communityDocRef);

            setCommunityStateValue((prev) => ({
                ...prev,
                currentCommunity: {
                    id: communityDoc.id,
                    ...communityDoc.data(),
                } as Community
            }));

        } catch (error: any) {
            console.log('getCommunityData error', error.message);

        }
    }

    useEffect(() => {
        if (!user) {
            // clear postVotes and communitySnippets when log out
            setCommunityStateValue((prev) => ({
                ...prev,
                mySnippets: []
            }));
            return;
        }
        getMySnippets()
    }, [user]);

    useEffect(() => {
        const { communityId } = router.query;

        if (communityId && !communityStateValue.currentCommunity) {
            getCommunityData(communityId as string)
        }
    }, [router.query, communityStateValue.currentCommunity])


    return {
        //data and functions
        communityStateValue,
        onJoinOrLeaveCommunity,
        loading,

    }
}
export default useCommunityData;