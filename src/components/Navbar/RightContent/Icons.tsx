import { Flex, Icon, useToast } from '@chakra-ui/react';
import React from 'react';
import { BsArrowUpRightCircle, BsChatDots } from "react-icons/bs";
import { GrAdd } from "react-icons/gr";
import {
    IoFilterCircleOutline,
    IoNotificationsOutline,
    IoVideocamOutline,
} from "react-icons/io5";
import { Tooltip } from '@chakra-ui/react'
import router from 'next/router';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/firebase/clientApp';
import { AuthModalState } from '@/atoms/authModalAtom';
import useDirectory from '@/hooks/useDirectory';
import { useSetRecoilState } from 'recoil';



const Icons: React.FC = () => {

    const [user] = useAuthState(auth);
    const setAuthModalState = useSetRecoilState(AuthModalState);
    const { toggleMenuOpen } = useDirectory();
    const toast = useToast();

    const infoMessage = (infoTitle: any) => {
        toast({
            title: `${infoTitle}`,
            duration: 5000,
            status: 'info',
            isClosable: true,
            position: 'top'
        })
    }

    const onClick = () => {
        if (!user) {
            setAuthModalState({ open: true, view: 'login' });
            infoMessage("Please Login first.")
            return
        }

        const { communityId } = router.query;
        // check user is in a community when clicked on the createPostLink
        if (communityId) {
            router.push(`/r/${communityId}/submit`);
            return
        }
        toggleMenuOpen();
        infoMessage("Choose a community to post inside.")
    };

    return (

        <Flex>
            <Flex display={{ base: 'none', md: 'flex' }}
                align="center"
                borderRight="1px solid"
                borderColor="gray.200"
            >
                <Flex mr={1.5} ml={1.5} padding={1} cursor="pointer" borderRadius={4} _hover={{ bg: 'gray.200' }}>
                    <Icon as={BsArrowUpRightCircle} fontSize={20} />
                </Flex>
                <Flex mr={1.5} ml={1.5} padding={1} cursor="pointer" borderRadius={4} _hover={{ bg: 'gray.200' }}>
                    <Icon as={IoFilterCircleOutline} fontSize={22} />
                </Flex>
                <Flex mr={1.5} ml={1.5} padding={1} cursor="pointer" borderRadius={4} _hover={{ bg: 'gray.200' }}>
                    <Icon as={IoVideocamOutline} fontSize={22} />
                </Flex>
            </Flex>
            <>
                <Flex mr={1.5} ml={1.5} padding={1} cursor="pointer" borderRadius={4} _hover={{ bg: 'gray.200' }}>
                    <Icon as={BsChatDots} fontSize={20} />
                </Flex>
                <Flex mr={1.5} ml={1.5} padding={1} cursor="pointer" borderRadius={4} _hover={{ bg: 'gray.200' }}>
                    <Icon as={IoNotificationsOutline} fontSize={20} />
                </Flex>
                <Flex display={{ base: 'none', md: 'flex' }} mr={1.5} ml={1.5} padding={1} cursor="pointer" borderRadius={4} _hover={{ bg: 'gray.200' }}>
                    <Tooltip hasArrow placement='top' label='Create post' bg='gray.300' color='black'>
                        <span>
                            <Icon as={GrAdd} fontSize={20} onClick={onClick} />
                        </span>
                    </Tooltip>
                </Flex>
            </>
        </Flex>

    )
}
export default Icons;