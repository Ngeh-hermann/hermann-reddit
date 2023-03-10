import { Community } from '@/atoms/communitiesAtom';
import { auth } from '@/firebase/clientApp';
import useCommunityData from '@/hooks/useCommunityData';
import { Box, Button, Flex, Icon, Image, Text, Tooltip } from '@chakra-ui/react';
import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { FaReddit } from 'react-icons/fa';

type HeaderProps = {
    communityData: Community;
};

const Header: React.FC<HeaderProps> = ({ communityData }) => {

    const [user] = useAuthState(auth);

    const { communityStateValue, onJoinOrLeaveCommunity, loading } = useCommunityData()

    const isJoined = !!communityStateValue.mySnippets.find(
        (item) => item.communityId === communityData.id
    )

    return (
        <>
            <Flex direction='column' width='100%' height='146px'>
                <Box height='50%' bg='blue.400' />
                <Flex justify='center' bg='white' flexGrow={1}>
                    <Flex width='95%' maxWidth='860px'>
                        {communityStateValue.currentCommunity?.imageURL ? (
                            <Image
                                borderRadius='full'
                                boxSize='66px'
                                alt='Mojotron Image'
                                position='relative'
                                top={-3}
                                color='blue.500'
                                border='4px solid #fff'
                                src={communityStateValue.currentCommunity.imageURL} />
                        ) : (

                            <Icon as={FaReddit}
                                fontSize={64} position='relative'
                                top={-3} color='blue.500'
                                border='4px solid white' borderRadius='50%'
                            />
                        )}
                        <Flex padding='10px 16px'>
                            <Flex direction='column' mr={6}>
                                <Text fontWeight={800} fontSize='16pt'>{communityData.id}</Text>
                                <Text
                                    fontWeight={600}
                                    fontSize='10pt'
                                    color='gray.400'
                                >
                                    r/{communityData.id}
                                </Text>
                            </Flex>
                            <Tooltip
                                hasArrow
                                bg='black' color='gray.300'
                                placement='top'
                                isDisabled={user?.uid != communityData.creatorId ? true : false}
                                label={user?.uid === communityData.creatorId && `You can't leave your community`}
                            >
                                <Button
                                    variant={isJoined ? 'outline' : 'solid'}
                                    height='30px'
                                    pr={6} pl={6}
                                    isDisabled={user?.uid === communityData.creatorId}
                                    isLoading={loading}
                                    onClick={
                                        () => onJoinOrLeaveCommunity(communityData, isJoined)
                                    }
                                >
                                    {isJoined ? 'Joined' : 'Join'}
                                </Button>
                            </Tooltip>
                        </Flex>
                    </Flex>
                </Flex>
            </Flex>
        </>
    )
}
export default Header;