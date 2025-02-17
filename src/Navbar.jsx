import React from 'react';
import { Box, Flex, IconButton } from '@chakra-ui/react';
import { FaHome, FaUser, FaCog } from 'react-icons/fa';

const Navbar = () => {
  return (
    <Box position="fixed" bottom="0" left="0" right="0" bg="white" boxShadow="md" py={2}>
      <Flex justify="space-around">
        <IconButton icon={<FaHome />} aria-label="Inicio" variant="ghost" />
        <IconButton icon={<FaUser />} aria-label="Perfil" variant="ghost" />
        <IconButton icon={<FaCog />} aria-label="Configuración" variant="ghost" />
      </Flex>
    </Box>
  );
};

export default Navbar;
