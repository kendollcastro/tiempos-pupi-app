import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Input, Button, Container,
  Text, Flex, VStack, HStack, IconButton
} from '@chakra-ui/react';
import { ChevronLeftIcon } from '@chakra-ui/icons';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const GreivinPage = () => {
  const { weekId } = useParams();
  const navigate = useNavigate();

  // Estados de ventas y gastos
  const [data, setData] = useState({
    lunes: {}, martes: {}, miercoles: {}, jueves: {}, viernes: {}, sabado: {}, domingo: {}
  });
  const [additionalAmount, setAdditionalAmount] = useState(""); // Gasto o retiro
  const [movements, setMovements] = useState([]); // Historial de movimientos

  // Franjas horarias y días
  const timeSlots = ["10:00 a. m.", "11:00 a. m.", "1:00 p. m.", "3:00 p. m.", "4:30 p. m.", "6:00 p. m.", "7:00 p. m.", "9:00 p. m."];
  const days = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];

  // 🔥 Cargar datos desde Firestore
  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, `weeks/${weekId}/data`, "greivin");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setData(data);
        setMovements(data.movements || []);
      }
    };

    fetchData();
  }, [weekId]);

  // 🔥 Guardar cambios en Firestore cuando se edita un campo
  const handleInputChange = async (day, time, type, value) => {
    const newData = { ...data };
    if (!newData[day]) newData[day] = {};
    if (!newData[day][time]) newData[day][time] = {};
    newData[day][time][type] = Number(value) || 0;

    setData(newData);
    await setDoc(doc(db, `weeks/${weekId}/data`, "greivin"), newData, { merge: true });
  };

  // 🔥 Función para agregar un gasto/retiro
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

    // Guardar en Firestore
    await setDoc(doc(db, `weeks/${weekId}/data`, "greivin"), { movements: updatedMovements }, { merge: true });
  };

  // 🔥 Cálculo de totales
  const calculateTotal = (type) => {
    return days.reduce((total, day) => {
      return total + timeSlots.reduce((sum, time) => sum + (data[day]?.[time]?.[type] || 0), 0);
    }, 0);
  };

  // 🔥 La comisión es el 7% del total de ventas
  const calculateCommission = () => {
    return (calculateTotal("venta") * 0.07).toFixed(2);
  };

  // 🔥 La ganancia es igual a la comisión
  const calculateProfit = () => {
    return calculateCommission();
  };

  // 🔥 La ganancia final resta los gastos
  const calculateFinalProfit = () => {
    const profit = parseFloat(calculateProfit());
    const totalMovements = movements.reduce((total, movement) => total + movement.amount, 0);
    return (profit - totalMovements).toFixed(2);
  };

  return (
    <Container maxW="container.xl" p={4}>
      <Button leftIcon={<ChevronLeftIcon />} onClick={() => navigate(-1)} mb={4}>
        Volver
      </Button>
      <Heading size="lg" mb={4}>Greivin - Semana {weekId}</Heading>

      {/* 🔥 Tabla de Ventas */}
      <Box overflowX="auto">
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th w="400px">Hora</Th> {/* Más ancha para mejor visibilidad */}
              {days.map(day => <Th key={day} w="400px">{day.charAt(0).toUpperCase() + day.slice(1)}</Th>)}
            </Tr>
          </Thead>
          <Tbody>
            {timeSlots.map(time => (
              <Tr key={time}>
                <Td>{time}</Td>
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
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* 🔥 Cálculos de Totales */}
      <Box mt={4} p={4} bg="gray.50" borderRadius="md">
        <Heading size="md" mb={2}>Totales</Heading>
        <Flex gap={4}>
          <Box>
            <Text fontWeight="bold">Total Ventas:</Text>
            <Text>¢{calculateTotal("venta")}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Comisión (7% de ventas):</Text>
            <Text>¢{calculateCommission()}</Text>
          </Box>
        </Flex>

        {/* 🔥 Ganancia (Igual a la comisión) */}
        <Box mt={4}>
          <Text fontWeight="bold" fontSize="lg" color="green.500">Ganancia: ¢{calculateProfit()}</Text>
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
          <Text fontWeight="bold">Ganancia Final (después de gastos):</Text>
          <Text>¢{calculateFinalProfit()}</Text>
        </Box>
      </Box>
    </Container>
  );
};

export default GreivinPage;
