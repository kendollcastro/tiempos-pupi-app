import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Input, Button, Container,
  Text, Flex, VStack, HStack, IconButton
} from '@chakra-ui/react';
import { ChevronLeftIcon, DeleteIcon } from '@chakra-ui/icons';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const GreivinPage = () => {
  const { weekId } = useParams();
  const navigate = useNavigate();

  // Estados de ventas, premios y movimientos
  const [data, setData] = useState({
    lunes: {}, martes: {}, miercoles: {}, jueves: {}, viernes: {}, sabado: {}, domingo: {}
  });
  const [additionalAmount, setAdditionalAmount] = useState("");
  const [movements, setMovements] = useState([]);

  // Franjas horarias combinadas (Costa Rica + Honduras)
  const timeSlots = [
    // Lotería Costa Rica
    "10:00 a. m. (Primera Dominicana)", 
    "11:00 a. m. (Nica)",
    "11:00 a. m. (Honduras)",
    "1:00 p. m. (Tica)", 
    "3:00 p. m. (Nica)",
    "3:00 p. m. (Honduras)",
    "4:30 p. m. (Tica)", 
    "6:00 p. m. (Primera Dominicana)", 
    "6:00 p. m. (Nica)", 
    "7:00 p. m. (Tica)", 
    "9:00 p. m. (Nica)",
    "9:00 p. m. (Honduras)"   
  ];

  const days = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];

  // Cargar datos desde Firestore
  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, `weeks/${weekId}/data`, "Greivin");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setData(data);
        setMovements(data.movements || []);
      }
    };

    fetchData();
  }, [weekId]);

  // Guardar cambios en Firestore
  const handleInputChange = async (day, time, type, value) => {
    const newData = { ...data };
    if (!newData[day]) newData[day] = {};
    if (!newData[day][time]) newData[day][time] = {};
    newData[day][time][type] = Number(value) || 0;

    setData(newData);
    await setDoc(doc(db, `weeks/${weekId}/data`, "Greivin"), newData, { merge: true });
  };

  // Agregar gasto/retiro
  const handleAdditionalAmount = async () => {
    if (!additionalAmount || isNaN(additionalAmount)) return;

    const amount = parseFloat(additionalAmount);
    const newMovement = {
      id: Date.now(),
      amount: amount,
      date: new Date().toLocaleString()
    };

    const updatedMovements = [newMovement, ...movements];
    setMovements(updatedMovements);
    setAdditionalAmount("");

    await setDoc(doc(db, `weeks/${weekId}/data`, "Greivin"), { 
      ...data,
      movements: updatedMovements 
    }, { merge: true });
  };

  // Eliminar movimiento
  const handleDeleteMovement = async (id) => {
    const updatedMovements = movements.filter(movement => movement.id !== id);
    setMovements(updatedMovements);

    await setDoc(doc(db, `weeks/${weekId}/data`, "Greivin"), { 
      ...data,
      movements: updatedMovements
    }, { merge: true });
  };

  // Cálculos
  const calculateDailyTotals = (day, type) => {
    return timeSlots.reduce((total, time) => total + (data[day]?.[time]?.[type] || 0), 0);
  };

  const calculateDailyCommission = (day) => {
    const ventasDiarias = calculateDailyTotals(day, "venta");
    return (ventasDiarias * 0.07).toFixed(2);
  };

  const calculateTotal = (type) => {
    return days.reduce((total, day) => total + calculateDailyTotals(day, type), 0);
  };

  const calculateCommission = () => {
    return (calculateTotal("venta") * 0.07).toFixed(2);
  };

  const calculateProfit = () => {
    const premios = calculateTotal("premio");
    const ventas = calculateTotal("venta");
    const comision = parseFloat(calculateCommission());
    const totalMovements = movements.reduce((total, movement) => total + movement.amount, 0);
  
    return (ventas - (premios + comision) + totalMovements).toFixed(2);
  };

  return (
    <Container maxW="container.xl" p={4}>
      <Button leftIcon={<ChevronLeftIcon />} onClick={() => navigate(-1)} mb={4}>
        Volver
      </Button>
      <Heading size="lg" mb={4}>Greivin - Semana {weekId}</Heading>

      {/* Tabla de Ventas y Premios */}
      <Box overflowX="auto">
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th 
                w="250px" 
                position="sticky" 
                left={0} 
                background="white" 
                zIndex={1} 
              >
                Hora
              </Th>
              {days.map(day => (
                <Th key={day} w="250px">{day.charAt(0).toUpperCase() + day.slice(1)}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {timeSlots.map(time => (
              <Tr key={time}>
                <Td 
                  position="sticky" 
                  left={0} 
                  background="white" 
                  fontWeight="bold" 
                  w="240px"
                  p="1" 
                  zIndex={1}
                >
                  {time}
                </Td>
                {days.map(day => (
                  <Td key={day}>
                    <Box>
                      <Text fontSize="sm">Venta:</Text>
                      <Input
                        type="number"
                        size="sm"
                        value={data[day]?.[time]?.venta || ''}
                        onChange={(e) => handleInputChange(day, time, 'venta', e.target.value)}
                        w="100px"
                      />
                    </Box>
                    <Box mt={1}>
                      <Text fontSize="sm">Premio:</Text>
                      <Input
                        type="number"
                        size="sm"
                        value={data[day]?.[time]?.premio || ''}
                        onChange={(e) => handleInputChange(day, time, 'premio', e.target.value)}
                        w="100px"
                      />
                    </Box>
                  </Td>
                ))}
              </Tr>
            ))}

            {/* Totales por Día */}
            <Tr bg="gray.100">
              <Td fontWeight="bold" position="sticky" left={0} background="white" zIndex={1}>
                Totales
              </Td>
              {days.map(day => (
                <Td key={day}>
                  <Box>
                    <Text fontSize="sm">Venta: ¢{calculateDailyTotals(day, "venta")}</Text>
                    <Text fontSize="sm">Premio: ¢{calculateDailyTotals(day, "premio")}</Text>
                    <Text fontSize="sm">Comisión: ¢{calculateDailyCommission(day)}</Text>
                  </Box>
                </Td>
              ))}
            </Tr>
          </Tbody>
        </Table>
      </Box>

      {/* Cálculos de Totales */}
      <Box mt={4} p={4} bg="gray.50" borderRadius="md">
        <Flex gap={4}>
          <Box>
            <Text fontWeight="bold">Total Ventas:</Text>
            <Text>¢{calculateTotal("venta")}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Total Premios:</Text>
            <Text>¢{calculateTotal("premio")}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Comisión (7% de ventas):</Text>
            <Text>¢{calculateCommission()}</Text>
          </Box>
        </Flex>

        {/* Ganancia */}
        <Box mt={4}>
          <Text fontWeight="bold" fontSize="lg" color={calculateProfit() < 0 ? "red.500" : "green.500"}>
            Ganancia: ¢{calculateProfit()}
          </Text>
        </Box>

        {/* Sección de Gasto / Retiro con Historial */}
        <Box mt={4}>
          <Text fontWeight="bold">Agregar adelanto:</Text>
          <HStack>
            <Input type="number" placeholder="Monto" value={additionalAmount} onChange={(e) => setAdditionalAmount(e.target.value)} width="150px" />
            <Button colorScheme="blue" onClick={handleAdditionalAmount}>Agregar</Button>
          </HStack>

          <VStack align="start" spacing={2} mt={4}>
            {movements.map(movement => (
              <HStack key={movement.id} p={2} borderRadius="md" width="100%" bg="gray.100">
                <Text fontSize="sm">📅 {movement.date} - ¢{movement.amount.toFixed(2)}</Text>
                <IconButton icon={<DeleteIcon />} colorScheme="red" size="sm" onClick={() => handleDeleteMovement(movement.id)} />
              </HStack>
            ))}
          </VStack>
        </Box>
      </Box>
    </Container>
  );
};

export default GreivinPage;