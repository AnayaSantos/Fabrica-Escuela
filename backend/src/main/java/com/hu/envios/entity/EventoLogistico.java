package com.hu.envios.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "eventos_logisticos")
public class EventoLogistico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "envio_id", nullable = false)
    private Envio envio;

    @Column(nullable = false)
    private LocalDateTime fechaHora;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private TipoEventoLogistico tipoEvento;

    @Enumerated(EnumType.STRING)
    @Column(length = 40)
    private EstadoEnvio estadoResultante;

    @Column(nullable = false, length = 120)
    private String ubicacion;

    @Column(length = 250)
    private String detalle;

    protected EventoLogistico() {
    }

    public EventoLogistico(
            Envio envio,
            TipoEventoLogistico tipoEvento,
            EstadoEnvio estadoResultante,
            String ubicacion,
            String detalle
    ) {
        this.envio = envio;
        this.tipoEvento = tipoEvento;
        this.estadoResultante = estadoResultante;
        this.ubicacion = ubicacion;
        this.detalle = detalle;
    }

    @PrePersist
    void onCreate() {
        fechaHora = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Envio getEnvio() {
        return envio;
    }

    public LocalDateTime getFechaHora() {
        return fechaHora;
    }

    public TipoEventoLogistico getTipoEvento() {
        return tipoEvento;
    }

    public EstadoEnvio getEstadoResultante() {
        return estadoResultante;
    }

    public String getUbicacion() {
        return ubicacion;
    }

    public String getDetalle() {
        return detalle;
    }
}
