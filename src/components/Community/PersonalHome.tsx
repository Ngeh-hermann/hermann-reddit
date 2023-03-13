import React, { useState } from "react";
import { Button, Flex, Icon, Stack, Text, useToast } from "@chakra-ui/react";
import { FaReddit } from "react-icons/fa";
import { AuthModalState } from "@/atoms/authModalAtom";
import useDirectory from "@/hooks/useDirectory";
import { useSetRecoilState } from "recoil";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/clientApp";
import { useRouter } from "next/router";
import CreateCommunityModal from "../Modal/CreateCommunity/CreateCommunityModal";

const PersonalHome: React.FC = () => {

    const setAuthModalState = useSetRecoilState(AuthModalState);
    const { toggleMenuOpen } = useDirectory();
    const [user] = useAuthState(auth);
    const router = useRouter();
    const [open, setOpen] = useState(false)

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
        <>
            <CreateCommunityModal open={open} handleClose={() => setOpen(false)} />

            <Flex
                direction="column"
                bg="white"
                borderRadius={4}
                cursor="pointer"
                border="1px solid"
                borderColor="gray.300"
                position="sticky"
            >
                <Flex
                    align="flex-end"
                    color="white"
                    p="6px 10px"
                    bg="blue.500"
                    height="34px"
                    borderRadius="4px 4px 0px 0px"
                    fontWeight={600}
                    bgImage="url(/images/redditPersonalHome.png)"
                    backgroundSize="cover"
                ></Flex>
                <Flex direction="column" p="12px">
                    <Flex align="center" mb={2}>
                        <Icon as={FaReddit} fontSize={50} color="brand.100" mr={2} />
                        <Text fontWeight={600}>Home</Text>
                    </Flex>
                    <Stack spacing={3}>
                        <Text fontSize="9pt">
                            Your personal Reddit frontpage, built for you.
                        </Text>
                        <Button height="30px" onClick={onClick}>Create Post</Button>
                        <Button
                            onClick={!user ? onClick : () => setOpen(true)}
                            variant="outline"
                            height="30px"
                        >
                            Create Community
                        </Button>
                    </Stack>
                </Flex>
            </Flex>
        </>
    );
};
export default PersonalHome;