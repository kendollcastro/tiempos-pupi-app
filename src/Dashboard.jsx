import React, { useState } from 'react';
import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Input, Button, Container,
  Menu, MenuButton, MenuList, MenuItem, Text, Flex, VStack, HStack, IconButton,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  useDisclosure
} from '@chakra-ui/react';
import { ChevronDownIcon, DeleteIcon } from '@chakra-ui/icons';

const SalesTracker = () => {
  // Estado para almacenar las semanas disponibles
  const [weeks, setWeeks] = useState([
    { id: 1, range: getCurrentWeekRange(), activeTable: null },
  ]);

  // Estados independientes para Greivin y Oscar
  const [dataGreivin, setDataGreivin] = useState({
    lunes: {},
    martes: {},
    miercoles: {},
    jueves: {},
    viernes: {},
    sabado: {},
    domingo: {},
  });

  const [dataOscar, setDataOscar] = useState({
    lunes: {},
    martes: {},
    miercoles: {},
    jueves: {},
    viernes: {},
    sabado: {},
    domingo: {},
  });

  // Estado para el monto adicional (gasto o retiro)
  const [additionalAmount, setAdditionalAmount] = useState('');

  // Estado para el registro de movimientos
  const [movements, setMovements] = useState([]);

  // Estado para la semana seleccionada para eliminar
  const [weekToDelete, setWeekToDelete] = useState(null);

  // Hook para controlar el modal de confirmación
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Franjas horarias
  const timeSlots = [
    "10:00 a. m.",
    "11:00 a. m.",
    "1:00 p. m.",
    "3:00 p. m.",
    "4:30 p. m.",
    "6:00 p. m.",
    "7:00 p. m.",
    "9:00 p. m.",
  ];

  // Días de la semana
  const days = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

  // Función para obtener el rango de la semana actual (lunes a domingo)
  function getCurrentWeekRange() {
    const today = new Date();
    const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1)); // Lunes
    const lastDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 7)); // Domingo

    const formatDate = (date) => {
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    };

    return `${formatDate(firstDayOfWeek)} - ${formatDate(lastDayOfWeek)}`;
  }

  // Función para obtener el rango de la semana siguiente basado en la última semana agregada
  function getNextWeekRange(lastWeekRange) {
    const lastWeekEndDate = new Date(lastWeekRange.split(' - ')[1]); // Obtener la fecha de fin de la última semana
    const nextMonday = new Date(lastWeekEndDate.setDate(lastWeekEndDate.getDate() + 1)); // Lunes de la próxima semana
    const nextSunday = new Date(lastWeekEndDate.setDate(lastWeekEndDate.getDate() + 6)); // Domingo de la próxima semana

    const formatDate = (date) => {
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    };

    return `${formatDate(nextMonday)} - ${formatDate(nextSunday)}`;
  }

  // Función para agregar una nueva semana
  const handleAddNextWeek = () => {
    const lastWeekRange = weeks[0].range; // Obtener el rango de la última semana agregada
    const nextWeekRange = getNextWeekRange(lastWeekRange); // Calcular la próxima semana
    const newWeek = {
      id: weeks.length + 1,
      range: nextWeekRange,
      activeTable: null,
    };
    setWeeks((prevWeeks) => [newWeek, ...prevWeeks]); // Agregar al principio del array
  };

  // Función para abrir el modal de confirmación de eliminación
  const handleDeleteWeek = (weekId) => {
    setWeekToDelete(weekId);
    onOpen();
  };

  // Función para eliminar la semana
  const confirmDeleteWeek = () => {
    setWeeks((prevWeeks) => prevWeeks.filter((week) => week.id !== weekToDelete));
    onClose();
  };

  // Función para actualizar ventas o premios
  const handleInputChange = (day, time, type, value, setData) => {
    setData((prevData) => ({
      ...prevData,
      [day]: {
        ...prevData[day],
        [time]: {
          ...prevData[day][time],
          [type]: Number(value) || 0,
        },
      },
    }));
  };

  // Función para calcular el total de ventas o premios por día
  const calculateTotal = (data, day, type) => {
    return timeSlots.reduce((total, time) => {
      return total + (data[day][time]?.[type] || 0);
    }, 0);
  };

  // Función para calcular la comisión (7% de las ventas)
  const calculateCommission = (data, day) => {
    const totalSales = calculateTotal(data, day, 'venta');
    return (totalSales * 0.07).toFixed(2); // 7% de comisión
  };

  // Función para calcular el total general de ventas, premios y comisiones
  const calculateGrandTotal = (data, type) => {
    return days.reduce((total, day) => {
      return total + (type === 'comision' ? parseFloat(calculateCommission(data, day)) : calculateTotal(data, day, type));
    }, 0);
  };

  // Función para calcular la ganancia
  const calculateProfit = (data) => {
    const totalVentas = calculateGrandTotal(data, 'venta');
    const totalPremios = calculateGrandTotal(data, 'premio');
    const totalComision = calculateGrandTotal(data, 'comision');
    return (totalVentas - totalPremios - totalComision).toFixed(2);
  };

  // Función para manejar el monto adicional (gasto o retiro)
  const handleAdditionalAmount = () => {
    if (!additionalAmount || isNaN(additionalAmount)) return;

    const amount = parseFloat(additionalAmount);
    const newMovement = {
      id: Date.now(), // Usamos el timestamp como ID único
      amount: amount,
      date: new Date().toLocaleString(), // Fecha y hora del movimiento
    };

    // Agregar el movimiento al registro
    setMovements((prevMovements) => [newMovement, ...prevMovements]);

    // Limpiar el campo de entrada
    setAdditionalAmount('');
  };

  // Función para calcular la ganancia final (ganancia - movimientos)
  const calculateFinalProfit = (data) => {
    const profit = parseFloat(calculateProfit(data));
    const totalMovements = movements.reduce((total, movement) => total + movement.amount, 0);
    return (profit - totalMovements).toFixed(2);
  };

  return (
    <Container maxW="container.xl" p={4}>
      <Heading size="lg" mb={4} textAlign="center">Seguimiento de Ventas</Heading>

      {/* 🔥 Botón para agregar la semana siguiente */}
      <Button colorScheme="teal" mt={4} onClick={handleAddNextWeek}>
        Agregar Semana Siguiente
      </Button>

      {/* 🔥 Dropdowns por Semana */}
      {weeks.map((week) => (
        <Box key={week.id} mb={4}>
          <Flex align="center" justify="space-between">
            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                colorScheme="blue"
                width="100%" // Ocupa el 100% del ancho
              >
                {week.activeTable ? `Mostrando: ${week.activeTable}` : `Semana: ${week.range}`}
              </MenuButton>
              <MenuList width="100%"> {/* Ocupa el 100% del ancho */}
                <MenuItem onClick={() => {
                  const updatedWeeks = weeks.map((w) =>
                    w.id === week.id ? { ...w, activeTable: "Oscar" } : w
                  );
                  setWeeks(updatedWeeks);
                }}>
                  Oscar
                </MenuItem>
                <MenuItem onClick={() => {
                  const updatedWeeks = weeks.map((w) =>
                    w.id === week.id ? { ...w, activeTable: "Greivin" } : w
                  );
                  setWeeks(updatedWeeks);
                }}>
                  Greivin
                </MenuItem>
              </MenuList>
            </Menu>

            {/* 🔥 Ícono de basurero para eliminar la semana */}
            <IconButton
              icon={<DeleteIcon />}
              aria-label="Eliminar semana"
              colorScheme="red"
              ml={2}
              onClick={() => handleDeleteWeek(week.id)}
            />
          </Flex>

          {/* 🔥 Tabla de Oscar o Greivin */}
          {week.activeTable && (
            <Box mt={4}>
              <Heading size="md" mb={4}>{week.activeTable}</Heading>
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Hora</Th>
                      {days.map((day) => (
                        <Th key={day}>{day.charAt(0).toUpperCase() + day.slice(1)}</Th>
                      ))}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {timeSlots.map((time) => (
                      <Tr key={time}>
                        <Td padding="0">{time}</Td>
                        {days.map((day) => (
                          <Td key={day} px={2}> {/* Reducir el padding */}
                            <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
                              <Text fontSize="sm">Venta:</Text>
                              <Input
                                type="number"
                                size="sm"
                                value={week.activeTable === 'Oscar' ? dataOscar[day][time]?.venta : dataGreivin[day][time]?.venta || ''}
                                onChange={(e) => handleInputChange(day, time, 'venta', e.target.value, week.activeTable === 'Oscar' ? setDataOscar : setDataGreivin)}
                                width="70px"
                              />
                            </Box>
                            <Box display="flex" alignItems="center" gap={2} mt={1}>
                              <Text fontSize="sm">Premio:</Text>
                              <Input
                                type="number"
                                size="sm"
                                value={week.activeTable === 'Oscar' ? dataOscar[day][time]?.premio : dataGreivin[day][time]?.premio || ''}
                                onChange={(e) => handleInputChange(day, time, 'premio', e.target.value, week.activeTable === 'Oscar' ? setDataOscar : setDataGreivin)}
                                width="70px"
                              />
                            </Box>
                          </Td>
                        ))}
                      </Tr>
                    ))}

                    {/* Totales */}
                    <Tr bg="gray.100">
                      <Td fontWeight="bold">Total</Td>
                      {days.map((day) => (
                        <Td key={day} px={2}> {/* Reducir el padding */}
                          <Box>Venta: {calculateTotal(week.activeTable === 'Oscar' ? dataOscar : dataGreivin, day, 'venta')}</Box>
                          <Box>Premio: {calculateTotal(week.activeTable === 'Oscar' ? dataOscar : dataGreivin, day, 'premio')}</Box>
                        </Td>
                      ))}
                    </Tr>

                    {/* Comisión */}
                    <Tr bg="gray.200">
                      <Td fontWeight="bold">Comisión</Td>
                      {days.map((day) => (
                        <Td key={day} px={2}> {/* Reducir el padding */}
                          ¢{calculateCommission(week.activeTable === 'Oscar' ? dataOscar : dataGreivin, day)}
                        </Td>
                      ))}
                    </Tr>
                  </Tbody>
                </Table>
              </Box>

              {/* 🔥 Total General y Ganancia */}
              <Box mt={4} p={4} bg="gray.50" borderRadius="md">
                <Heading size="md" mb={2}>Total General</Heading>
                <Flex gap={4}>
                  <Box>
                    <Text fontWeight="bold">Total Ventas:</Text>
                    <Text>¢{calculateGrandTotal(week.activeTable === 'Oscar' ? dataOscar : dataGreivin, 'venta')}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">Total Premios:</Text>
                    <Text>¢{calculateGrandTotal(week.activeTable === 'Oscar' ? dataOscar : dataGreivin, 'premio')}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">Total Comisión:</Text>
                    <Text>¢{calculateGrandTotal(week.activeTable === 'Oscar' ? dataOscar : dataGreivin, 'comision')}</Text>
                  </Box>
                </Flex>

                {/* 🔥 Ganancia */}
                <Box mt={4}>
                  <Text fontWeight="bold">Ganancia:</Text>
                  <Text>¢{calculateProfit(week.activeTable === 'Oscar' ? dataOscar : dataGreivin)}</Text>
                </Box>

                {/* 🔥 Monto Adicional (Gasto o Retiro) */}
                <Box mt={4}>
                  <Text fontWeight="bold">Agregar Gasto/Retiro:</Text>
                  <HStack>
                    <Input
                      type="number"
                      placeholder="Monto"
                      value={additionalAmount}
                      onChange={(e) => setAdditionalAmount(e.target.value)}
                      width="150px"
                    />
                    <Button colorScheme="blue" onClick={handleAdditionalAmount}>
                      Agregar
                    </Button>
                  </HStack>
                </Box>

                {/* 🔥 Ganancia Final */}
                <Box mt={4}>
                  <Text fontWeight="bold">Ganancia Final:</Text>
                  <Text>¢{calculateFinalProfit(week.activeTable === 'Oscar' ? dataOscar : dataGreivin)}</Text>
                </Box>

                {/* 🔥 Registro de Movimientos */}
                <Box mt={4} mb={10}>
                  <Text fontWeight="bold">Registro de Movimientos:</Text>
                  <VStack align="start" spacing={2} mt={2}>
                    {movements.map((movement) => (
                      <Box key={movement.id} p={2} bg="gray.100" borderRadius="md" width="100%">
                        <Text fontSize="sm">
                          {movement.date} - ¢{movement.amount.toFixed(2)}
                        </Text>
                      </Box>
                    ))}
                  </VStack>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      ))}

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

export default SalesTracker;