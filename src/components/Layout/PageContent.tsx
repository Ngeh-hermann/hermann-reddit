import { Flex } from '@chakra-ui/react';
import React from 'react';

type PageContentProps = {
    children: any
};

const PageContent: React.FC<PageContentProps> = ({ children }) => {

    return (
        <Flex justify='center' p='16px 0px'>
            <Flex width='95%' justify='center' maxWidth='860px'>
                {/* left side */}
                <Flex
                    direction='column'
                    width={{ base: '100%', md: '65%' }}
                    mr={{ base: 0, md: 6 }}
                >
                    {children[0]}
                </Flex>

                {/* right side */}
                <Flex
                    direction='column'
                    display={{ base: 'none', md: 'flex' }}
                    flexGrow={1}
                >
                    {children[1]}
                </Flex>
            </Flex>
        </Flex>
    )
}
export default PageContent;