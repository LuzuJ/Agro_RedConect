/**
 * Custom error classes for better error handling and user feedback
 */

export class ModelNotLoadedError extends Error {
  constructor(message = 'El modelo de IA no está cargado') {
    super(message);
    this.name = 'ModelNotLoadedError';
  }
}

export class ImageProcessingError extends Error {
  constructor(message = 'Error al procesar la imagen') {
    super(message);
    this.name = 'ImageProcessingError';
  }
}

export class InferenceError extends Error {
  constructor(message = 'Error al ejecutar la detección') {
    super(message);
    this.name = 'InferenceError';
  }
}

export class NoDetectionsError extends Error {
  constructor(message = 'No se detectaron enfermedades en la imagen') {
    super(message);
    this.name = 'NoDetectionsError';
  }
}

export class CameraPermissionError extends Error {
  constructor(message = 'No se tienen permisos de cámara') {
    super(message);
    this.name = 'CameraPermissionError';
  }
}

export class LocationPermissionError extends Error {
  constructor(message = 'No se tienen permisos de ubicación') {
    super(message);
    this.name = 'LocationPermissionError';
  }
}

/**
 * Retorna un mensaje user-friendly basado en el tipo de error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ModelNotLoadedError) {
    return 'El modelo de IA aún no está listo. Por favor, espera unos segundos e intenta de nuevo.';
  }

  if (error instanceof ImageProcessingError) {
    return 'No pudimos procesar la imagen. Asegúrate de que la foto esté clara y bien iluminada.';
  }

  if (error instanceof InferenceError) {
    return 'Hubo un problema al analizar la imagen. Por favor, intenta de nuevo.';
  }

  if (error instanceof NoDetectionsError) {
    return 'No se detectaron enfermedades en la imagen. Intenta acercarte más a la planta.';
  }

  if (error instanceof CameraPermissionError) {
    return 'Necesitamos acceso a la cámara para escanear plantas. Ve a Configuración para habilitar permisos.';
  }

  if (error instanceof LocationPermissionError) {
    return 'Necesitamos acceso a tu ubicación para el mapa de detecciones. Ve a Configuración para habilitar permisos.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Ocurrió un error inesperado. Por favor, intenta de nuevo.';
}

/**
 * Retorna un título para el error
 */
export function getErrorTitle(error: unknown): string {
  if (error instanceof ModelNotLoadedError) {
    return 'Modelo Cargando';
  }

  if (error instanceof ImageProcessingError) {
    return 'Error de Imagen';
  }

  if (error instanceof InferenceError) {
    return 'Error de Análisis';
  }

  if (error instanceof NoDetectionsError) {
    return 'Sin Detecciones';
  }

  if (error instanceof CameraPermissionError || error instanceof LocationPermissionError) {
    return 'Permisos Requeridos';
  }

  return 'Error';
}

/**
 * Determina si un error es recuperable (puede reintentar)
 */
export function isRetryableError(error: unknown): boolean {
  return (
    error instanceof ImageProcessingError ||
    error instanceof InferenceError ||
    error instanceof NoDetectionsError
  );
}
