import React, { useState, useEffect } from 'react';
import {
  Container, Heading, Button, Box, Menu, MenuButton, MenuList, MenuItem, IconButton, Flex, Text,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure
} from '@chakra-ui/react';
import { ChevronDownIcon, DeleteIcon } from '@chakra-ui/icons';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';

// 🔥 Función para calcular el rango de la próxima semana
const getNextWeekRange = (lastWeekRange) => {
  let startDate, endDate;

  if (lastWeekRange) {
    const lastSunday = new Date(lastWeekRange.split(' - ')[1]);

    startDate = new Date(lastSunday);
    startDate.setDate(lastSunday.getDate() + 1); // Siguiente lunes
    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6); // Siguiente domingo
  } else {
    const today = new Date();
    startDate = new Date(today);
    startDate.setDate(today.getDate() - today.getDay() + 1); // Primer lunes
    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6); // Siguiente domingo
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

const WeekList = () => {
  const [weeks, setWeeks] = useState([]);
  const [weekToDelete, setWeekToDelete] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // 🔥 Cargar semanas desde Firestore
  useEffect(() => {
    const fetchWeeks = async () => {
      const querySnapshot = await getDocs(collection(db, "weeks"));
      const weeksData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      weeksData.sort((a, b) => new Date(b.range.split(' - ')[0]) - new Date(a.range.split(' - ')[0]));

      setWeeks(weeksData);
    };
    fetchWeeks();
  }, []);

  // 🔥 Agregar una nueva semana a Firestore y colocarla en la parte superior
  const handleAddWeek = async () => {
    const lastWeekRange = weeks.length > 0 ? weeks[0].range : null;
    const newWeekRange = getNextWeekRange(lastWeekRange);

    const newWeek = {
      range: newWeekRange,
      createdAt: new Date()
    };

    try {
      const docRef = await addDoc(collection(db, "weeks"), newWeek);
      setWeeks(prevWeeks => [{ id: docRef.id, ...newWeek }, ...prevWeeks]); // Agregar arriba
    } catch (error) {
      console.error("Error al agregar la semana: ", error);
    }
  };

  // 🔥 Eliminar una semana con confirmación en modal
  const confirmDeleteWeek = async () => {
    if (!weekToDelete) return;
    try {
      await deleteDoc(doc(db, "weeks", weekToDelete));
      setWeeks(prevWeeks => prevWeeks.filter(week => week.id !== weekToDelete));
    } catch (error) {
      console.error("Error al eliminar la semana: ", error);
    }
    setWeekToDelete(null);
    onClose();
  };

  return (
    <Container maxW="container.md" p={4}>
      <Heading mb={4}>Lista de Semanas</Heading>
      <Button colorScheme="teal" mb={4} onClick={handleAddWeek}>
        Agregar Semana
      </Button>

      {/* 🔥 Lista de Semanas con Dropdowns */}
      {weeks.length > 0 ? (
        weeks.map((week) => (
          <Box key={week.id} mb={4} p={3} borderRadius="md" bg="gray.100">
            <Flex align="center" justify="space-between">
              <Menu>
                <MenuButton as={Button} rightIcon={<ChevronDownIcon />} colorScheme="blue" width="80%">
                  {week.range}
                </MenuButton>
                <MenuList>
                  <Link to={`/salestracker/${week.id}/greivin`}>
                    <MenuItem>Greivin</MenuItem>
                  </Link>
                  <Link to={`/salestracker/${week.id}/oscar`}>
                    <MenuItem>Oscar</MenuItem>
                  </Link>
                </MenuList>
              </Menu>

              {/* 🔥 Ícono de basurero con confirmación modal */}
              <IconButton
                icon={<DeleteIcon />}
                aria-label="Eliminar semana"
                colorScheme="red"
                onClick={() => {
                  setWeekToDelete(week.id);
                  onOpen();
                }}
              />
            </Flex>
          </Box>
        ))
      ) : (
        <Text>No hay semanas disponibles.</Text>
      )}

      {/* 🔥 Modal de Confirmación para Eliminar Semana */}
      <Modal isOpen={isOpen} onClose={onClose}>
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
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default WeekList;
