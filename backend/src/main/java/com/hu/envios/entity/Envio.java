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
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "envios")
public class Envio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String numeroGuia;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "remitente_id", nullable = false)
    private Contacto remitente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "destinatario_id", nullable = false)
    private Contacto destinatario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "direccion_origen_id", nullable = false)
    private Direccion direccionOrigen;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "direccion_destino_id", nullable = false)
    private Direccion direccionDestino;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal pesoKg;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoServicio tipoServicio;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private EstadoEnvio estadoActual;

    @Column(nullable = false)
    private LocalDate fechaEstimadaEntrega;

    @Column(nullable = false)
    private LocalDateTime fechaRegistro;

    @Column(nullable = false)
    private LocalDateTime fechaUltimaActualizacion;

    protected Envio() {
    }

    public Envio(
            String numeroGuia,
            Contacto remitente,
            Contacto destinatario,
            Direccion direccionOrigen,
            Direccion direccionDestino,
            BigDecimal pesoKg,
            TipoServicio tipoServicio,
            LocalDate fechaEstimadaEntrega
    ) {
        this.numeroGuia = numeroGuia;
        this.remitente = remitente;
        this.destinatario = destinatario;
        this.direccionOrigen = direccionOrigen;
        this.direccionDestino = direccionDestino;
        this.pesoKg = pesoKg;
        this.tipoServicio = tipoServicio;
        this.fechaEstimadaEntrega = fechaEstimadaEntrega;
        this.estadoActual = EstadoEnvio.PENDIENTE_RECOLECCION;
    }

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        fechaRegistro = now;
        fechaUltimaActualizacion = now;
    }

    public void actualizarEstado(EstadoEnvio nuevoEstado) {
        estadoActual = nuevoEstado;
        fechaUltimaActualizacion = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getNumeroGuia() {
        return numeroGuia;
    }

    public Contacto getRemitente() {
        return remitente;
    }

    public Contacto getDestinatario() {
        return destinatario;
    }

    public Direccion getDireccionOrigen() {
        return direccionOrigen;
    }

    public Direccion getDireccionDestino() {
        return direccionDestino;
    }

    public BigDecimal getPesoKg() {
        return pesoKg;
    }

    public TipoServicio getTipoServicio() {
        return tipoServicio;
    }

    public EstadoEnvio getEstadoActual() {
        return estadoActual;
    }

    public LocalDate getFechaEstimadaEntrega() {
        return fechaEstimadaEntrega;
    }

    public LocalDateTime getFechaRegistro() {
        return fechaRegistro;
    }

    public LocalDateTime getFechaUltimaActualizacion() {
        return fechaUltimaActualizacion;
    }
}
