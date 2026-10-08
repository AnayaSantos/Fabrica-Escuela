package com.hu.envios.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "vehiculos")
public class Vehiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String placa;

    @Column(nullable = false, length = 120)
    private String conductor;

    @Column(nullable = false, length = 40)
    private String tipo;

    @Column(nullable = false)
    private boolean activo;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    /**
     * Informativa: rutas que este vehiculo esta habilitado para cubrir. No se hace cumplir como
     * restriccion dura al asignar transporte (HU-007), por decision explicita confirmada.
     */
    @ManyToMany
    @JoinTable(
            name = "vehiculo_rutas",
            joinColumns = @JoinColumn(name = "vehiculo_id"),
            inverseJoinColumns = @JoinColumn(name = "ruta_id")
    )
    private List<Ruta> rutasHabilitadas = new ArrayList<>();

    protected Vehiculo() {
    }

    public Vehiculo(String placa, String conductor, String tipo) {
        this.placa = placa;
        this.conductor = conductor;
        this.tipo = tipo;
        this.activo = true;
    }

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public void actualizar(String placa, String conductor, String tipo) {
        this.placa = placa;
        this.conductor = conductor;
        this.tipo = tipo;
    }

    public void habilitarRuta(Ruta ruta) {
        if (!rutasHabilitadas.contains(ruta)) {
            rutasHabilitadas.add(ruta);
        }
    }

    public Long getId() {
        return id;
    }

    public String getPlaca() {
        return placa;
    }

    public String getConductor() {
        return conductor;
    }

    public String getTipo() {
        return tipo;
    }

    public boolean isActivo() {
        return activo;
    }

    public List<Ruta> getRutasHabilitadas() {
        return rutasHabilitadas;
    }
}
