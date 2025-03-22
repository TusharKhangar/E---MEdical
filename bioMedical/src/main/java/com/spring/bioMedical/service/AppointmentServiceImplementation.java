package com.spring.bioMedical.service;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.spring.bioMedical.entity.Admin;
import com.spring.bioMedical.entity.Appointment;
import com.spring.bioMedical.repository.AppointmentRepository;

@Service
public class AppointmentServiceImplementation  {

	private static final Logger logger = LoggerFactory.getLogger(AppointmentServiceImplementation.class);

	private final AppointmentRepository appointmentRepository;

	//inject employee dao
	@Autowired   //Adding bean id @Qualifier
	public AppointmentServiceImplementation( AppointmentRepository obj)
	{
		appointmentRepository=obj;
	}


	public void save(Appointment app)
	{

		appointmentRepository.save(app);
	}


	public List<Appointment> findAll() {
		return appointmentRepository.findAll();
	}

	public Optional<Appointment> findById(int id) {
		logger.info("Finding appointment by ID: {}", id);
		return appointmentRepository.findById(Math.toIntExact(id));
	}

	public void deleteById(int id) {
		logger.info("Deleting appointment by ID: {}", id);
		appointmentRepository.deleteById(id);
	}


}
