import React from 'react';
import { Button, Center, VStack, Text, Image } from '@chakra-ui/react';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase';
import { useNavigate } from 'react-router-dom';

const Login = ({ setUser }) => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      navigate('/'); // Redirigir a la lista de semanas después de iniciar sesión
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
    }
  };

  return (
    <Center h="100vh" bg="gray.100">
      <VStack spacing={6} p={6} boxShadow="lg" bg="white" borderRadius="md">
        <Image 
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png" 
          boxSize="50px" 
        />
        <Text fontSize="xl" fontWeight="bold">Bienvenido</Text>
        <Button colorScheme="teal" onClick={handleLogin} size="lg">
          Iniciar sesión con Google
        </Button>
      </VStack>
    </Center>
  );
};

export default Login;
