package com.hu.envios.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "paradas_ruta")
public class ParadaRuta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ruta_id", nullable = false)
    private Ruta ruta;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "centro_distribucion_id", nullable = false)
    private CentroDistribucion centroDistribucion;

    @Column(nullable = false)
    private int orden;

    protected ParadaRuta() {
    }

    public ParadaRuta(Ruta ruta, CentroDistribucion centroDistribucion, int orden) {
        this.ruta = ruta;
        this.centroDistribucion = centroDistribucion;
        this.orden = orden;
    }

    public Long getId() {
        return id;
    }

    public Ruta getRuta() {
        return ruta;
    }

    public CentroDistribucion getCentroDistribucion() {
        return centroDistribucion;
    }

    public int getOrden() {
        return orden;
    }
}
