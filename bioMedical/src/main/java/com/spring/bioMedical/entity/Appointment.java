package com.spring.bioMedical.entity;

import  jakarta.persistence.Column;
import  jakarta.persistence.Entity;
import  jakarta.persistence.GeneratedValue;
import  jakarta.persistence.GenerationType;
import  jakarta.persistence.Id;
import  jakarta.persistence.Table;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Transient;

/**
 * 
 * @
 *
 *
 */
@Entity
@Data
@Table(name = "app")
public class Appointment {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(name = "id")
	private Long id;
	
    @Column(name = "name", nullable = false, unique = true)
	private String name;
	
    @Column(name = "email")
	private String email;
	
    @Column(name = "date")
	private String date;
	
    @Column(name = "time")
	private String time;
	
	
    @Column(name = "description")
	private String description;

	
    @Column(name = "regtime")
	private String regtime;


    @Override
	public String toString() {
		return "Appointment [id=" + id + ", name=" + name + ", email=" + email + ", date=" + date + ", time=" + time
				+ ", description=" + description + "]";
	}
	
	

}