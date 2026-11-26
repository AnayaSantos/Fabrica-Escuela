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
@Table(name = "incidencias")
public class Incidencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "envio_id", nullable = false)
    private Envio envio;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "evento_id", nullable = false)
    private EventoLogistico evento;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_incidencia", nullable = false, length = 40)
    private TipoIncidencia tipoIncidencia;

    @Column(nullable = false, length = 500)
    private String descripcion;

    @Column(name = "evidencia")
    private byte[] evidencia;

    @Column(name = "evidencia_nombre", length = 255)
    private String evidenciaNombre;

    @Column(name = "evidencia_content_type", length = 100)
    private String evidenciaContentType;

    @Column(name = "fecha_hora", nullable = false)
    private LocalDateTime fechaHora;

    @Column(name = "registrado_por", length = 120)
    private String registradoPor;

    protected Incidencia() {
    }

    public Incidencia(
            Envio envio,
            EventoLogistico evento,
            TipoIncidencia tipoIncidencia,
            String descripcion,
            byte[] evidencia,
            String evidenciaNombre,
            String evidenciaContentType,
            String registradoPor
    ) {
        this.envio = envio;
        this.evento = evento;
        this.tipoIncidencia = tipoIncidencia;
        this.descripcion = descripcion;
        this.evidencia = evidencia;
        this.evidenciaNombre = evidenciaNombre;
        this.evidenciaContentType = evidenciaContentType;
        this.registradoPor = registradoPor;
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

    public EventoLogistico getEvento() {
        return evento;
    }

    public TipoIncidencia getTipoIncidencia() {
        return tipoIncidencia;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public byte[] getEvidencia() {
        return evidencia;
    }

    public String getEvidenciaNombre() {
        return evidenciaNombre;
    }

    public String getEvidenciaContentType() {
        return evidenciaContentType;
    }

    public LocalDateTime getFechaHora() {
        return fechaHora;
    }

    public String getRegistradoPor() {
        return registradoPor;
    }
}
