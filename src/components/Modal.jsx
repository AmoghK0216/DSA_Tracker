import React from 'react';
import { X, AlertTriangle, Info } from 'lucide-react';

const Modal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  type = 'confirm', // 'confirm' or 'alert'
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning' // 'warning' or 'info'
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-app-card rounded-xl border border-app-border shadow-2xl max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-app-border">
          <div className="flex items-center gap-3">
            {variant === 'warning' ? (
              <div className="w-10 h-10 rounded-full bg-yellow-600/20 flex items-center justify-center">
                <AlertTriangle className="text-yellow-500" size={20} />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-app-accent/20 flex items-center justify-center">
                <Info className="text-app-accent" size={20} />
              </div>
            )}
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-app-text-muted hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-app-text-secondary">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t border-app-border">
          {type === 'confirm' && (
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-app-card-hover hover:bg-app-input rounded-lg transition-colors font-medium"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors font-medium ${
              variant === 'warning'
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                : 'bg-app-accent hover:bg-app-accent-hover text-white'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
