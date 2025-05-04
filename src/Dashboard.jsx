import React, { useState } from 'react';
import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Input, Button, Container,
  Menu, MenuButton, MenuList, MenuItem, Text, Flex, VStack, HStack, IconButton,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  useDisclosure, FormControl, FormLabel, Select
} from '@chakra-ui/react';
import { ChevronDownIcon, DeleteIcon, AddIcon } from '@chakra-ui/icons';

const SalesTracker = () => {
  // Estado para almacenar las semanas (solo con nombre manual)
  const [weeks, setWeeks] = useState([]); // Inicialmente vacío

  // Estados para los datos de los vendedores
  const [dataGreivin, setDataGreivin] = useState({
    lunes: {}, martes: {}, miercoles: {}, jueves: {}, viernes: {}, sabado: {}, domingo: {},
  });

  const [dataOscar, setDataOscar] = useState({
    lunes: {}, martes: {}, miercoles: {}, jueves: {}, viernes: {}, sabado: {}, domingo: {},
  });

  // Estados para los modales
  const { isOpen: isWeekModalOpen, onOpen: onWeekModalOpen, onClose: onWeekModalClose } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();

  // Estado para la semana actual
  const [currentWeek, setCurrentWeek] = useState({
    id: null,
    name: "",
    activeTable: null,
    activeCountry: null
  });

  // Estado para el formulario de nueva semana
  const [newWeekData, setNewWeekData] = useState({ 
    name: "" 
  });

  // Horarios de lotería
  const [lotteryTimes, setLotteryTimes] = useState({
    honduras: ["11:00 a.m.", "3:00 p.m.", "9:00 p.m."]
  });

  // Estados para movimientos financieros
  const [additionalAmount, setAdditionalAmount] = useState('');
  const [movements, setMovements] = useState([]);
  const [weekToDelete, setWeekToDelete] = useState(null);

  // Constantes
  const days = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
  const countries = ['Costa Rica', 'Honduras'];

  // Función para crear una nueva semana manualmente
  const handleAddWeek = () => {
    setNewWeekData({ name: "" });
    setCurrentWeekId(null);
    onWeekModalOpen();
  };

  // Función para guardar la semana manualmente
  const saveWeekData = () => {
    if (!newWeekData.name.trim()) {
      alert("Por favor ingrese un nombre para la semana");
      return;
    }

    const newWeek = {
      id: weeks.length > 0 ? Math.max(...weeks.map(w => w.id)) + 1 : 1,
      name: newWeekData.name,
      activeTable: null,
      activeCountry: null
    };

    setWeeks([...weeks, newWeek]);
    onWeekModalClose();
  };

  // Función para seleccionar una semana existente
  const selectWeek = (week) => {
    setCurrentWeek(week);
  };

  // Función para editar una semana
  const handleEditWeek = (week) => {
    setNewWeekData({ name: week.name });
    setCurrentWeekId(week.id);
    onWeekModalOpen();
  };

  // Función para eliminar una semana
  const handleDeleteWeek = (weekId) => {
    setWeekToDelete(weekId);
    onDeleteModalOpen();
  };

  const confirmDeleteWeek = () => {
    setWeeks(weeks.filter(week => week.id !== weekToDelete));
    if (currentWeek.id === weekToDelete) {
      setCurrentWeek({
        id: null,
        name: "",
        activeTable: null,
        activeCountry: null
      });
    }
    onDeleteModalClose();
  };

  // Resto de funciones de negocio (sin cambios)
  const handleInputChange = (day, time, type, value, setData) => {
    setData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [time]: {
          ...prev[day][time],
          [type]: Number(value) || 0,
        },
      },
    }));
  };

  const handleAddManualTime = (day, week) => {
    const newTime = prompt("Ingrese la hora (ej: 10:00 a. m.):");
    if (newTime) {
      const vendorId = `${week.activeTable}-${week.id}`;
      setLotteryTimes(prev => ({
        ...prev,
        [vendorId]: {
          ...prev[vendorId],
          [day]: [...(prev[vendorId]?.[day] || []), newTime]
        }
      }));
    }
  };

  const calculateTotal = (data, day, type, week) => {
    const times = week.activeCountry === 'Honduras' 
      ? lotteryTimes.honduras 
      : lotteryTimes[`${week.activeTable}-${week.id}`]?.[day] || [];
    
    return times.reduce((total, time) => total + (data[day][time]?.[type] || 0), 0);
  };

  const calculateCommission = (data, day, week) => {
    return (calculateTotal(data, day, 'venta', week) * 0.07).toFixed(2);
  };

  const calculateGrandTotal = (data, type, week) => {
    return days.reduce((total, day) => total + (
      type === 'comision' 
        ? parseFloat(calculateCommission(data, day, week)) 
        : calculateTotal(data, day, type, week)
    ), 0);
  };

  const calculateProfit = (data, week) => {
    const totalVentas = calculateGrandTotal(data, 'venta', week);
    const totalPremios = calculateGrandTotal(data, 'premio', week);
    const totalComision = calculateGrandTotal(data, 'comision', week);
    return (totalVentas - totalPremios - totalComision).toFixed(2);
  };

  const handleAdditionalAmount = () => {
    if (!additionalAmount || isNaN(additionalAmount)) return;

    const newMovement = {
      id: Date.now(),
      amount: parseFloat(additionalAmount),
      date: new Date().toLocaleString(),
    };

    setMovements([newMovement, ...movements]);
    setAdditionalAmount('');
  };

  const calculateFinalProfit = (data, week) => {
    const profit = parseFloat(calculateProfit(data, week));
    const totalMovements = movements.reduce((total, m) => total + m.amount, 0);
    return (profit - totalMovements).toFixed(2);
  };

  const getTimesForDay = (day, week) => {
    return week.activeCountry === 'Honduras' 
      ? lotteryTimes.honduras 
      : lotteryTimes[`${week.activeTable}-${week.id}`]?.[day] || [];
  };

  return (
    <Container maxW="container.xl" p={4}>
      <Heading size="lg" mb={4} textAlign="center">Seguimiento de Ventas</Heading>

      {/* Panel de selección de semana */}
      <Box mb={6} p={4} borderWidth="1px" borderRadius="lg">
        <Heading size="md" mb={4}>Semanas</Heading>
        
        <Flex gap={4} mb={4}>
          <Button colorScheme="teal" onClick={handleAddWeek}>
            Crear Nueva Semana
          </Button>
        </Flex>

        {weeks.length > 0 ? (
          <VStack align="stretch">
            {weeks.map(week => (
              <Flex 
                key={week.id} 
                p={3} 
                borderWidth="1px" 
                borderRadius="md"
                bg={currentWeek.id === week.id ? "blue.50" : "white"}
                cursor="pointer"
                onClick={() => selectWeek(week)}
                justify="space-between"
                align="center"
              >
                <Text fontWeight="medium">{week.name}</Text>
                <HStack>
                  <IconButton
                    icon={<DeleteIcon />}
                    aria-label="Eliminar semana"
                    size="sm"
                    colorScheme="red"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteWeek(week.id);
                    }}
                  />
                </HStack>
              </Flex>
            ))}
          </VStack>
        ) : (
          <Text textAlign="center" color="gray.500">
            No hay semanas creadas. Haz clic en "Crear Nueva Semana" para comenzar.
          </Text>
        )}
      </Box>

      {/* Contenido de la semana seleccionada */}
      {currentWeek.id && (
        <Box mb={4} p={4} borderWidth="1px" borderRadius="lg">
          <Flex align="center" justify="space-between" mb={4}>
            <Heading size="md">{currentWeek.name}</Heading>
            <Button size="sm" onClick={() => handleEditWeek(currentWeek)}>
              Editar Nombre
            </Button>
          </Flex>

          {/* Selección de Vendedor y País */}
          <Flex gap={4} mb={4}>
            <Select 
              placeholder="Seleccionar Vendedor" 
              value={currentWeek.activeTable || ""}
              onChange={(e) => setCurrentWeek({
                ...currentWeek,
                activeTable: e.target.value || null
              })}
            >
              <option value="Oscar">Oscar</option>
              <option value="Greivin">Greivin</option>
            </Select>

            <Select 
              placeholder="Seleccionar País" 
              value={currentWeek.activeCountry || ""}
              onChange={(e) => setCurrentWeek({
                ...currentWeek,
                activeCountry: e.target.value || null
              })}
            >
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </Select>
          </Flex>

          {/* Tabla de ventas */}
          {currentWeek.activeTable && currentWeek.activeCountry && (
            <Box mt={4}>
              <Heading size="md" mb={4}>
                {currentWeek.activeTable} - {currentWeek.activeCountry}
              </Heading>
              
              <Box overflowX="auto">
                {days.map((day) => (
                  <Box key={day} mb={6}>
                    <Flex justify="space-between" align="center" mb={2}>
                      <Heading size="sm" textTransform="capitalize">{day}</Heading>
                      {currentWeek.activeCountry === 'Costa Rica' && (
                        <Button 
                          size="sm" 
                          leftIcon={<AddIcon />} 
                          onClick={() => handleAddManualTime(day, currentWeek)}
                        >
                          Agregar Hora
                        </Button>
                      )}
                    </Flex>
                    
                    <Table variant="simple" size="sm" mb={4}>
                      <Thead>
                        <Tr>
                          <Th>Hora</Th>
                          <Th>Venta</Th>
                          <Th>Premio</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {getTimesForDay(day, currentWeek).map((time) => (
                          <Tr key={time}>
                            <Td>{time}</Td>
                            <Td>
                              <Input
                                type="number"
                                size="sm"
                                value={currentWeek.activeTable === 'Oscar' 
                                  ? dataOscar[day][time]?.venta || '' 
                                  : dataGreivin[day][time]?.venta || ''}
                                onChange={(e) => handleInputChange(
                                  day, 
                                  time, 
                                  'venta', 
                                  e.target.value, 
                                  currentWeek.activeTable === 'Oscar' ? setDataOscar : setDataGreivin
                                )}
                                width="100px"
                              />
                            </Td>
                            <Td>
                              <Input
                                type="number"
                                size="sm"
                                value={currentWeek.activeTable === 'Oscar' 
                                  ? dataOscar[day][time]?.premio || '' 
                                  : dataGreivin[day][time]?.premio || ''}
                                onChange={(e) => handleInputChange(
                                  day, 
                                  time, 
                                  'premio', 
                                  e.target.value, 
                                  currentWeek.activeTable === 'Oscar' ? setDataOscar : setDataGreivin
                                )}
                                width="100px"
                              />
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>

                    <Box bg="gray.100" p={2} borderRadius="md">
                      <Text fontWeight="bold">Totales del día:</Text>
                      <Flex justify="space-between">
                        <Text>Ventas: ¢{calculateTotal(
                          currentWeek.activeTable === 'Oscar' ? dataOscar : dataGreivin, 
                          day, 
                          'venta', 
                          currentWeek
                        )}</Text>
                        <Text>Premios: ¢{calculateTotal(
                          currentWeek.activeTable === 'Oscar' ? dataOscar : dataGreivin, 
                          day, 
                          'premio', 
                          currentWeek
                        )}</Text>
                        <Text>Comisión: ¢{calculateCommission(
                          currentWeek.activeTable === 'Oscar' ? dataOscar : dataGreivin, 
                          day, 
                          currentWeek
                        )}</Text>
                      </Flex>
                    </Box>
                  </Box>
                ))}
              </Box>

              {/* Totales generales */}
              <Box mt={4} p={4} bg="gray.50" borderRadius="md">
                <Heading size="md" mb={2}>Total General</Heading>
                <Flex gap={4} flexWrap="wrap">
                  <Box>
                    <Text fontWeight="bold">Total Ventas:</Text>
                    <Text>¢{calculateGrandTotal(
                      currentWeek.activeTable === 'Oscar' ? dataOscar : dataGreivin, 
                      'venta', 
                      currentWeek
                    )}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">Total Premios:</Text>
                    <Text>¢{calculateGrandTotal(
                      currentWeek.activeTable === 'Oscar' ? dataOscar : dataGreivin, 
                      'premio', 
                      currentWeek
                    )}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">Total Comisión:</Text>
                    <Text>¢{calculateGrandTotal(
                      currentWeek.activeTable === 'Oscar' ? dataOscar : dataGreivin, 
                      'comision', 
                      currentWeek
                    )}</Text>
                  </Box>
                </Flex>

                <Box mt={4}>
                  <Text fontWeight="bold">Ganancia:</Text>
                  <Text>¢{calculateProfit(
                    currentWeek.activeTable === 'Oscar' ? dataOscar : dataGreivin, 
                    currentWeek
                  )}</Text>
                </Box>

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

                <Box mt={4}>
                  <Text fontWeight="bold">Ganancia Final:</Text>
                  <Text>¢{calculateFinalProfit(
                    currentWeek.activeTable === 'Oscar' ? dataOscar : dataGreivin, 
                    currentWeek
                  )}</Text>
                </Box>

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
      )}

      {/* Modal para crear/editar semana */}
      <Modal isOpen={isWeekModalOpen} onClose={onWeekModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{currentWeek.id ? "Editar Semana" : "Crear Nueva Semana"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Nombre de la semana</FormLabel>
              <Input 
                placeholder="Ej: Semana 1, Enero 2023, etc."
                value={newWeekData.name}
                onChange={(e) => setNewWeekData({name: e.target.value})}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={saveWeekData}>
              {currentWeek.id ? "Guardar Cambios" : "Crear Semana"}
            </Button>
            <Button variant="ghost" onClick={onWeekModalClose}>
              Cancelar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de confirmación para eliminar semana */}
      <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirmar Eliminación</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>¿Estás seguro de que deseas eliminar esta semana? Esta acción no se puede deshacer.</Text>
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

export default SalesTracker;