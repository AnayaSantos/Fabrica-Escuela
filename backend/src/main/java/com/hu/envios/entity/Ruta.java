package com.hu.envios.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "rutas")
public class Ruta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nombre;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "centro_origen_id", nullable = false)
    private CentroDistribucion centroOrigen;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "centro_destino_id", nullable = false)
    private CentroDistribucion centroDestino;

    @Column(nullable = false)
    private boolean activa;

    @OneToMany(mappedBy = "ruta", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orden ASC")
    private List<ParadaRuta> paradas = new ArrayList<>();

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    protected Ruta() {
    }

    public Ruta(String nombre, CentroDistribucion centroOrigen, CentroDistribucion centroDestino) {
        this.nombre = nombre;
        this.centroOrigen = centroOrigen;
        this.centroDestino = centroDestino;
        this.activa = true;
    }

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void actualizar(String nombre, CentroDistribucion centroOrigen, CentroDistribucion centroDestino) {
        this.nombre = nombre;
        this.centroOrigen = centroOrigen;
        this.centroDestino = centroDestino;
    }

    public void reemplazarParadas(List<CentroDistribucion> centrosEnOrden) {
        paradas.clear();
        int orden = 1;
        for (CentroDistribucion centro : centrosEnOrden) {
            paradas.add(new ParadaRuta(this, centro, orden++));
        }
    }

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public CentroDistribucion getCentroOrigen() {
        return centroOrigen;
    }

    public CentroDistribucion getCentroDestino() {
        return centroDestino;
    }

    public boolean isActiva() {
        return activa;
    }

    public List<ParadaRuta> getParadas() {
        return paradas;
    }
}
