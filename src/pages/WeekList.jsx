import React, { useState, useEffect } from 'react';
import {
  Container, Heading, Button, Box, Menu, MenuButton, MenuList, MenuItem, IconButton, 
  Flex, Text, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, 
  ModalBody, ModalCloseButton, useDisclosure, Input, FormControl, FormLabel
} from '@chakra-ui/react';
import { ChevronDownIcon, DeleteIcon } from '@chakra-ui/icons';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';

const WeekList = () => {
  const [weeks, setWeeks] = useState([]);
  const [weekToDelete, setWeekToDelete] = useState(null);
  const [newWeekName, setNewWeekName] = useState('');
  const { 
    isOpen: isDeleteModalOpen, 
    onOpen: onDeleteModalOpen, 
    onClose: onDeleteModalClose 
  } = useDisclosure();
  
  const { 
    isOpen: isAddModalOpen, 
    onOpen: onAddModalOpen, 
    onClose: onAddModalClose 
  } = useDisclosure();

  // Cargar semanas desde Firestore
  useEffect(() => {
    const fetchWeeks = async () => {
      const querySnapshot = await getDocs(collection(db, "weeks"));
      const weeksData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Ordenar por fecha de creación (más reciente primero)
      weeksData.sort((a, b) => b.createdAt - a.createdAt);
      setWeeks(weeksData);
    };
    fetchWeeks();
  }, []);

  // Agregar una nueva semana manualmente
  const handleAddWeek = async () => {
    if (!newWeekName.trim()) {
      alert("Por favor ingrese un nombre para la semana");
      return;
    }

    const newWeek = {
      name: newWeekName,
      createdAt: new Date().getTime() // Usamos timestamp para ordenar
    };

    try {
      const docRef = await addDoc(collection(db, "weeks"), newWeek);
      setWeeks(prevWeeks => [{ id: docRef.id, ...newWeek }, ...prevWeeks]);
      setNewWeekName('');
      onAddModalClose();
    } catch (error) {
      console.error("Error al agregar la semana: ", error);
    }
  };

  // Eliminar una semana con confirmación
  const confirmDeleteWeek = async () => {
    if (!weekToDelete) return;
    try {
      await deleteDoc(doc(db, "weeks", weekToDelete));
      setWeeks(prevWeeks => prevWeeks.filter(week => week.id !== weekToDelete));
    } catch (error) {
      console.error("Error al eliminar la semana: ", error);
    }
    setWeekToDelete(null);
    onDeleteModalClose();
  };

  return (
    <Container maxW="container.md" p={4}>
      <Heading mb={4}>Lista de Semanas</Heading>
      <Button colorScheme="teal" mb={4} onClick={onAddModalOpen}>
        Agregar Semana Manualmente
      </Button>

      {/* Lista de Semanas */}
      {weeks.length > 0 ? (
        weeks.map((week) => (
          <Box key={week.id} mb={4} p={3} borderRadius="md" bg="gray.100">
            <Flex align="center" justify="space-between">
              <Menu>
                <MenuButton 
                  as={Button} 
                  rightIcon={<ChevronDownIcon />} 
                  colorScheme="blue" 
                  width="80%"
                >
                  {week.name || `Semana ${week.id}`}
                </MenuButton>
                <MenuList>
                  <Link to={`/salestracker/${week.id}/greivin`}>
                    <MenuItem>Greivin</MenuItem>
                  </Link>
                  {/* <Link to={`/salestracker/${week.id}/oscar`}>
                    <MenuItem>Oscar</MenuItem>
                  </Link> */}
                </MenuList>
              </Menu>

              <IconButton
                icon={<DeleteIcon />}
                aria-label="Eliminar semana"
                colorScheme="red"
                onClick={() => {
                  setWeekToDelete(week.id);
                  onDeleteModalOpen();
                }}
              />
            </Flex>
          </Box>
        ))
      ) : (
        <Text>No hay semanas disponibles.</Text>
      )}

      {/* Modal para agregar semana manualmente */}
      <Modal isOpen={isAddModalOpen} onClose={onAddModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Agregar Nueva Semana</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Nombre de la semana</FormLabel>
              <Input
                placeholder="Ej: Semana 1, Julio 2023, etc."
                value={newWeekName}
                onChange={(e) => setNewWeekName(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleAddWeek}>
              Guardar
            </Button>
            <Button variant="ghost" onClick={onAddModalClose}>
              Cancelar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de Confirmación para Eliminar Semana */}
      <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Eliminar Semana</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>¿Estás seguro de que deseas eliminar esta semana?</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={confirmDeleteWeek}>
              Eliminar
            </Button>
            <Button variant="ghost" onClick={onDeleteModalClose}>
              Cancelar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default WeekList;