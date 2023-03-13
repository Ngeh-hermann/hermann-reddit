import { AuthModalState } from '@/atoms/authModalAtom';
import { auth, firestore } from '../../../firebase/clientApp';
import { FIREBASE_ERRORS } from '../../../firebase/errors';
import { Input, Button, Flex, Text, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth'
import { User } from 'firebase/auth';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';


const SignUp: React.FC = () => {

    const toast = useToast();

    const setAuthModalState = useSetRecoilState(AuthModalState)

    const [signUpForm, setSignUpForm] = useState({
        email: '',
        password: '',
        confirmPassword: '',
    })

    const [error, setError] = useState('')

    // firebase auth hooks
    const [
        createUserWithEmailAndPassword,
        userCred,
        loading,
        userError,
    ] = useCreateUserWithEmailAndPassword(auth);

    // Firebase logic
    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (error) setError('');
        if (signUpForm.password !== signUpForm.confirmPassword) {
            setError("Password do not match");
            return;
        }
        // password match
        createUserWithEmailAndPassword(signUpForm.email, signUpForm.password);
        toast({
            title: 'Account Created',
            description: 'We have created your account for you !',
            position: 'top',
            isClosable: true,
            duration: 6000,
            status: 'success',
        })

    }

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        // update form state
        setSignUpForm((prev) => ({
            ...prev,
            [event.target.name]: event.target.value,
        }))
    }

    //user doc in firestore
    // const createUserDocument = async (user: User) => {
    //     await addDoc(collection(firestore, "users",), JSON.parse(JSON.stringify(user)));
    // }

    const createUserDocument = async (user: User) => {
        const userDocRef = doc(firestore, "users", user.uid);
        await setDoc(userDocRef, JSON.parse(JSON.stringify(user)));
    }

    useEffect(() => {
        if (userCred) {
            createUserDocument(userCred.user)
        }
    }, [userCred])


    return (
        <>
            <form onSubmit={onSubmit}>
                <Input
                    required
                    name='email'
                    placeholder='email'
                    type='email'
                    mb={2}
                    onChange={onChange}
                    fontSize='10pt'
                    _placeholder={{ color: 'gray.500' }}
                    _hover={{
                        bg: 'white',
                        border: '1px solid',
                        borderColor: 'blue.500',
                    }}
                    _focus={{
                        outline: 'none',
                        bg: 'white',
                        border: '1px solid',
                        borderColor: 'blue.500',
                    }}
                    bg='gray.50'
                />
                <Input
                    required
                    name='password'
                    placeholder='Password'
                    type='password'
                    mb={2}
                    onChange={onChange}
                    fontSize='10pt'
                    _placeholder={{ color: 'gray.500' }}
                    _hover={{
                        bg: 'white',
                        border: '1px solid',
                        borderColor: 'blue.500',
                    }}
                    _focus={{
                        outline: 'none',
                        bg: 'white',
                        border: '1px solid',
                        borderColor: 'blue.500',
                    }}
                    bg='gray.50'
                />
                <Input
                    required
                    name='confirmPassword'
                    placeholder='Confirm Password'
                    type='password'
                    mb={2}
                    onChange={onChange}
                    fontSize='10pt'
                    _placeholder={{ color: 'gray.500' }}
                    _hover={{
                        bg: 'white',
                        border: '1px solid',
                        borderColor: 'blue.500',
                    }}
                    _focus={{
                        outline: 'none',
                        bg: 'white',
                        border: '1px solid',
                        borderColor: 'blue.500',
                    }}
                    bg='gray.50'
                />
                {(error || userError) && (
                    <Text textAlign='center' color='red' fontSize='10pt'>
                        {error || FIREBASE_ERRORS[
                            userError?.message as keyof typeof FIREBASE_ERRORS
                        ]}
                    </Text>
                )}
                <Button
                    width='100%'
                    height='36px'
                    mt={2} mb={2}
                    type='submit'
                    isLoading={loading}>
                    Sign Up
                </Button>
                <Flex fontSize='9pt' justifyContent='center'>
                    <Text mr={1}>Already a redditot ?</Text>
                    <Text
                        color='blue.500'
                        fontWeight={700}
                        cursor='pointer'
                        onClick={() =>
                            setAuthModalState((prev) => ({
                                ...prev,
                                view: 'login',
                            }))
                        }
                    >
                        LOG IN</Text>
                </Flex>
            </form>
        </>
    )
}
export default SignUp;