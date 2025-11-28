import { useState, useRef } from 'react';
import { useDiagnosis, usePlants } from '@/hooks';
import { useAuth } from '@/contexts/AuthContext';
import { Icons } from '@/components/ui/Icons';
import type { IDiagnosisResult } from '@/types';

interface DiagnosisModalProps {
  readonly plantId: string;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

type DiagnosisStep = 'upload' | 'analyzing' | 'result';

export function DiagnosisModal({ plantId, isOpen, onClose }: DiagnosisModalProps) {
  const { user } = useAuth();
  const { diagnose, shareAsPost, lastRecord, isAnalyzing } = useDiagnosis();
  const { getPlant, updatePlantStatus } = usePlants();

  const [step, setStep] = useState<DiagnosisStep>('upload');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<IDiagnosisResult | null>(null);
  const [shareComment, setShareComment] = useState('');
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!imagePreview || !plantId || !user) return;

    setStep('analyzing');
    try {
      const diagnosisResponse = await diagnose(imagePreview, plantId, user.id);
      
      if (diagnosisResponse) {
        setResult(diagnosisResponse.diagnosis);

        // Update plant status if disease detected
        if (diagnosisResponse.diagnosis.severity !== 'none') {
          await updatePlantStatus(plantId, 'Enfermo', {
            id: diagnosisResponse.diagnosis.diseaseName.toLowerCase().replaceAll(/\s+/g, '-'),
            name: diagnosisResponse.diagnosis.diseaseName,
          });
        }

        setStep('result');
      } else {
        setStep('upload');
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      setStep('upload');
    }
  };

  const handleShare = async () => {
    if (!result || !user || !lastRecord) return;

    setSharing(true);
    try {
      const plant = await getPlant(plantId);
      await shareAsPost(
        lastRecord.id,
        user.id,
        shareComment.trim() || `Diagnóstico de ${plant?.name || 'mi planta'}: ${result.diseaseName}`,
        user.name,
        user.avatar || ''
      );
      setShared(true);
    } catch (error) {
      console.error('Error sharing diagnosis:', error);
    } finally {
      setSharing(false);
    }
  };

  const handleClose = () => {
    setStep('upload');
    setImagePreview(null);
    setResult(null);
    setShareComment('');
    setShared(false);
    onClose();
  };

  if (!isOpen) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'medium':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'low':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'none':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'Severa';
      case 'medium':
        return 'Moderada';
      case 'low':
        return 'Leve';
      case 'none':
        return 'Ninguna';
      default:
        return severity;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Icons.Microscope className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Diagnóstico con IA
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Icons.X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {step === 'upload' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Toma o sube una foto de la planta para analizar su estado de salud.
              </p>

              {/* Image Upload Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  imagePreview
                    ? 'border-emerald-300 bg-emerald-50'
                    : 'border-gray-300 hover:border-emerald-400 hover:bg-gray-50'
                }`}
              >
                {imagePreview ? (
                  <div className="space-y-4">
                    <img
                      src={imagePreview}
                      alt="Vista previa"
                      className="max-h-48 mx-auto rounded-lg"
                    />
                    <p className="text-sm text-gray-500">
                      Toca para cambiar la imagen
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Icons.Camera className="w-12 h-12 mx-auto text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-700">
                        Subir imagen
                      </p>
                      <p className="text-sm text-gray-500">
                        Haz clic o arrastra una imagen aquí
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Tips */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">
                  📸 Tips para mejores resultados
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Asegúrate de tener buena iluminación</li>
                  <li>• Enfoca las hojas o partes afectadas</li>
                  <li>• Evita sombras sobre la planta</li>
                  <li>• Toma la foto lo más cerca posible</li>
                </ul>
              </div>

              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
                disabled={!imagePreview || isAnalyzing}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Icons.ZoomIn className="w-5 h-5" />
                Analizar imagen
              </button>
            </div>
          )}

          {step === 'analyzing' && (
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-6" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Analizando imagen...
              </h3>
              <p className="text-gray-500">
                Nuestra IA está examinando tu planta
              </p>

              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Analizando"
                  className="max-h-32 mx-auto mt-6 rounded-lg opacity-50"
                />
              )}
            </div>
          )}

          {step === 'result' && result && (
            <div className="space-y-4">
              {/* Result Card */}
              <div
                className={`rounded-xl border-2 p-4 ${getSeverityColor(
                  result.severity
                )}`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl">
                    {result.severity === 'none' ? '✅' : '⚠️'}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">{result.diseaseName}</h3>
                    {result.scientificName && (
                      <p className="text-sm italic opacity-75">
                        {result.scientificName}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(
                          result.severity
                        )}`}
                      >
                        Gravedad: {getSeverityLabel(result.severity)}
                      </span>
                      <span className="text-sm">
                        {Math.round(result.confidence * 100)}% confianza
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700">{result.description}</p>
              </div>

              {/* Symptoms */}
              {result.symptoms.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    🔍 Síntomas
                  </h4>
                  <ul className="space-y-1">
                    {result.symptoms.map((symptom) => (
                      <li
                        key={`symptom-${symptom.slice(0, 20)}`}
                        className="flex items-start gap-2 text-sm text-gray-600"
                      >
                        <span className="text-red-500">•</span>
                        {symptom}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Treatment */}
              {result.treatment.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    💊 Tratamiento
                  </h4>
                  <ul className="space-y-1">
                    {result.treatment.map((treatmentStep, i) => (
                      <li
                        key={`treatment-${treatmentStep.slice(0, 20)}`}
                        className="flex items-start gap-2 text-sm text-gray-600"
                      >
                        <span className="text-emerald-500">{i + 1}.</span>
                        {treatmentStep}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Prevention */}
              {result.prevention.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    🛡️ Prevención
                  </h4>
                  <ul className="space-y-1">
                    {result.prevention.map((tip) => (
                      <li
                        key={`prevention-${tip.slice(0, 20)}`}
                        className="flex items-start gap-2 text-sm text-gray-600"
                      >
                        <span className="text-blue-500">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Share Section */}
              <div className="border-t border-gray-100 pt-4 mt-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Compartir diagnóstico
                </h4>
                {shared ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <Icons.Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-green-700">
                      ¡Diagnóstico compartido en el feed!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <textarea
                      value={shareComment}
                      onChange={(e) => setShareComment(e.target.value)}
                      placeholder="Agrega un comentario (opcional)..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      rows={2}
                    />
                    <button
                      onClick={handleShare}
                      disabled={sharing}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      <Icons.Share className="w-4 h-4" />
                      {sharing ? 'Compartiendo...' : 'Compartir en el feed'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'result' && (
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={handleClose}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
