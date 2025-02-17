// pages/SalesTracker.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Heading, Text, Button, Box } from '@chakra-ui/react';
import { ChevronLeftIcon } from '@chakra-ui/icons';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const SalesTracker = ({ user }) => {
  const { weekId } = useParams();
  const navigate = useNavigate();
  const [weekData, setWeekData] = useState(null);

  useEffect(() => {
    const fetchWeek = async () => {
      // Se asume que las semanas están en la colección "weeks"
      const querySnapshot = await getDocs(collection(db, "weeks"));
      const weeksData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const selectedWeek = weeksData.find(week => week.id === weekId);
      setWeekData(selectedWeek);
    };
    fetchWeek();
  }, [weekId]);

  return (
    <Container maxW="container.xl" p={4}>
      <Button leftIcon={<ChevronLeftIcon />} onClick={() => navigate(-1)} mb={4}>
        Volver
      </Button>
      {weekData ? (
        <Box>
          <Heading mb={4}>Semana: {weekData.range}</Heading>
          {/* Aquí puedes colocar el contenido de tu SalesTracker (tablas, formularios, etc.) */}
          <Text>Contenido del SalesTracker para la semana {weekData.range}.</Text>
        </Box>
      ) : (
        <Text>Cargando datos...</Text>
      )}
    </Container>
  );
};

export default SalesTracker;
