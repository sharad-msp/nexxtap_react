import React, { useState, useEffect } from 'react';
import { X, Monitor, Smartphone, Tablet, Clock, MapPin, Globe } from 'lucide-react';
import { Modal, Button, LoadingSpinner } from '@/components';
import { userApi } from '@/api';
import { formatDate } from '@/utils/formatDate';
import { useToast } from '@/components/Toast';

interface DeviceLog {
  id: number;
  device_id: string;
  device_name: string;
  device_model: string;
  device_type: 'pos' | 'kds';
  ip_address: string;
  user_agent: string;
  login_at: string;
  created_at: string;
}

interface DeviceLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  userName: string;
}

const DeviceLogsModal: React.FC<DeviceLogsModalProps> = ({
  isOpen,
  onClose,
  userId,
  userName
}) => {
  const [deviceLogs, setDeviceLogs] = useState<DeviceLog[]>([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen && userId) {
      fetchDeviceLogs();
    }
  }, [isOpen, userId]);

  const fetchDeviceLogs = async () => {
    setLoading(true);
    try {
      const response = await userApi.getDeviceLogs(userId);
      setDeviceLogs(response.data);
    } catch (error) {
      console.error('Error fetching device logs:', error);
      showToast('error', 'Failed to fetch device logs');
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'pos':
        return <Monitor className="h-5 w-5 text-indigo-600" />;
      case 'kds':
        return <Tablet className="h-5 w-5 text-green-600" />;
      default:
        return <Smartphone className="h-5 w-5 text-gray-600" />;
    }
  };

  const getDeviceTypeColor = (deviceType: string) => {
    switch (deviceType) {
      case 'pos':
        return 'bg-indigo-100 text-indigo-800';
      case 'kds':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeviceTypeLabel = (deviceType: string) => {
    return deviceType.toUpperCase();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Device Logs - ${userName}`}
      size="lg"
    >
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : deviceLogs.length === 0 ? (
          <div className="text-center py-8">
            <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No device logs found for this user.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {deviceLogs.map((log) => (
              <div
                key={log.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {getDeviceIcon(log.device_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {log.device_name || 'Unknown Device'}
                        </h4>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDeviceTypeColor(log.device_type)}`}>
                          {getDeviceTypeLabel(log.device_type)}
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        {log.device_model && (
                          <div className="flex items-center space-x-1">
                            <span className="font-medium">Model:</span>
                            <span>{log.device_model}</span>
                          </div>
                        )}
                        
                        {log.device_id && (
                          <div className="flex items-center space-x-1">
                            <span className="font-medium">Device ID:</span>
                            <span className="font-mono text-xs">{log.device_id}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span className="font-medium">IP:</span>
                          <span>{log.ip_address}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span className="font-medium">Login:</span>
                          <span>{formatDate(log.login_at)}</span>
                        </div>
                        
                        {log.user_agent && (
                          <div className="flex items-start space-x-1">
                            <Globe className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                              <span className="font-medium">User Agent:</span>
                              <div className="text-xs text-gray-500 break-all">
                                {log.user_agent}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeviceLogsModal;
