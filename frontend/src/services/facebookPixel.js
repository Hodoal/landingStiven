/**
 * Servicio para Facebook Pixel - Tracking de eventos
 */

// Verificar si Facebook Pixel está disponible
const isFbqAvailable = () => {
  return typeof window !== 'undefined' && window.fbq;
};

/**
 * Envía eventos personalizados a Facebook Pixel
 * @param {string} event - Nombre del evento
 * @param {object} data - Datos adicionales del evento
 */
export const trackEvent = (event, data = {}) => {
  if (isFbqAvailable()) {
    window.fbq('track', event, data);
    console.log(`📊 Facebook Pixel: Evento '${event}' enviado`, data);
  } else {
    console.warn('⚠️ Facebook Pixel no está disponible');
  }
};

/**
 * Envía eventos personalizados a Facebook Pixel
 * @param {string} event - Nombre del evento personalizado
 * @param {object} data - Datos adicionales del evento
 */
export const trackCustomEvent = (event, data = {}) => {
  if (isFbqAvailable()) {
    window.fbq('trackCustom', event, data);
    console.log(`📊 Facebook Pixel: Evento personalizado '${event}' enviado`, data);
  } else {
    console.warn('⚠️ Facebook Pixel no está disponible');
  }
};

/**
 * Eventos estándar predefinidos para Stivenads
 */
export const FacebookPixelEvents = {
  // Evento cuando alguien llena el formulario de contacto
  LEAD_GENERATED: (data = {}) => trackEvent('Lead', {
    content_name: 'Formulario de Lead',
    content_category: 'lead_generation',
    ...data
  }),
  
  // Evento cuando alguien agenda una cita
  SCHEDULE_APPOINTMENT: (data = {}) => trackEvent('Schedule', {
    content_name: 'Asesoría de Marketing',
    content_category: 'Consultation',
    value: 100,
    currency: 'USD',
    ...data
  }),
  
  // Evento cuando alguien completa una cita
  COMPLETE_APPOINTMENT: (data = {}) => trackEvent('CompleteRegistration', {
    content_name: 'Consulta Completada',
    value: 150,
    currency: 'USD',
    ...data
  }),
  
  // Evento de conversión personalizada - Lead calificado
  QUALIFIED_LEAD: (data = {}) => trackCustomEvent('QualifiedLead', {
    content_name: 'Lead Calificado',
    value: 50,
    currency: 'USD',
    ...data
  }),
  
  // Evento cuando alguien hace clic en WhatsApp
  WHATSAPP_CLICK: (data = {}) => trackCustomEvent('WhatsAppClick', {
    content_name: 'Contacto WhatsApp',
    ...data
  }),
  
  // Evento cuando alguien descarga un recurso
  RESOURCE_DOWNLOAD: (resourceName, data = {}) => trackEvent('Download', {
    content_name: resourceName,
    content_type: 'resource',
    ...data
  }),
  
  // Evento de visualización de contenido importante
  VIEW_CONTENT: (contentName, data = {}) => trackEvent('ViewContent', {
    content_name: contentName,
    content_type: 'article',
    ...data
  }),
  
  // Evento cuando se abre el modal de aplicación
  START_APPLICATION: (data = {}) => trackCustomEvent('StartApplication', {
    content_name: 'Inicio Aplicación Piloto',
    ...data
  }),
  
  // Evento cuando se abre el modal de booking
  START_BOOKING: (data = {}) => trackCustomEvent('StartBooking', {
    content_name: 'Inicio Agendamiento',
    ...data
  }),
  
  // Evento cuando se completa el formulario de booking
  COMPLETE_BOOKING_FORM: (data = {}) => trackCustomEvent('CompleteBookingForm', {
    content_name: 'Formulario Agendamiento Completado',
    ...data
  }),
  
  // Evento cuando se confirma un agendamiento
  CONFIRM_BOOKING: (data = {}) => trackEvent('Schedule', {
    content_name: 'Agendamiento Confirmado',
    content_category: 'booking',
    value: 100,
    currency: 'USD',
    ...data
  }),
  
  // Evento cuando se hace clic en CTA
  CTA_CLICK: (ctaLocation, data = {}) => trackCustomEvent('CTAClick', {
    content_name: 'Click en CTA',
    cta_location: ctaLocation,
    ...data
  }),
  
  // Evento cuando se hace scroll
  SCROLL_DEPTH: (depth, data = {}) => trackCustomEvent('ScrollDepth', {
    content_name: `Scroll ${depth}%`,
    scroll_depth: depth,
    ...data
  })
};

/**
 * Hook de React para usar Facebook Pixel fácilmente
 */
import { useEffect } from 'react';

export const useFacebookPixel = () => {
  useEffect(() => {
    // Verificar que el pixel esté cargado
    if (isFbqAvailable()) {
      console.log('✅ Facebook Pixel inicializado correctamente');
    } else {
      console.warn('⚠️ Facebook Pixel no se pudo inicializar');
    }
  }, []);

  return {
    trackEvent,
    trackCustomEvent,
    events: FacebookPixelEvents,
    isAvailable: isFbqAvailable()
  };
};