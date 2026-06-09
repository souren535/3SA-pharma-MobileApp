import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouteStore } from '../../store/store';
import { StatusModal } from '../../components/ui/status-modal';

export default function AssignedRoutesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { routes, selectedRouteId, selectRoute, isLockedToday, loadRouteState } = useRouteStore();
  const [expandedRoutes, setExpandedRoutes] = useState<Set<number>>(new Set());
  const [localSelectedId, setLocalSelectedId] = useState<number | null>(selectedRouteId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    type: 'info' as 'success' | 'error' | 'info',
    title: '',
    message: '',
  });

  // Load persisted lock state on mount
  useEffect(() => {
    loadRouteState();
  }, []);

  // Sync localSelectedId when store changes (e.g., after loadRouteState)
  useEffect(() => {
    setLocalSelectedId(selectedRouteId);
  }, [selectedRouteId]);

  const hasMultipleRoutes = routes.length > 1;
  const hasChanges = localSelectedId !== selectedRouteId && localSelectedId !== null;

  const toggleRoute = (routeId: number) => {
    setExpandedRoutes(prev => {
      const next = new Set(prev);
      if (next.has(routeId)) {
        next.delete(routeId);
      } else {
        next.add(routeId);
      }
      return next;
    });
  };

  const handleSelectRoute = (routeId: number) => {
    if (isLockedToday) {
      setModalConfig({
        visible: true,
        type: 'info',
        title: 'Route Locked',
        message: 'You have already selected a route for today. You can change your route again tomorrow.',
      });
      return;
    }
    if (localSelectedId === routeId) return;
    setLocalSelectedId(routeId);
  };

  const handleSubmit = async () => {
    if (!localSelectedId) return;

    if (isLockedToday) {
      setModalConfig({
        visible: true,
        type: 'info',
        title: 'Route Locked',
        message: 'You have already selected a route for today. You can change your route again tomorrow.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await selectRoute(localSelectedId);
      setModalConfig({
        visible: true,
        type: 'success',
        title: 'Route Selected',
        message: 'Your route has been confirmed for today. You can change it again tomorrow.',
      });
      setTimeout(() => router.back(), 1500);
    } catch (error: any) {
      const serverMsg = error?.response?.data?.message;
      setModalConfig({
        visible: true,
        type: 'error',
        title: 'Error',
        message: serverMsg || 'Failed to select route. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-[#F3F6F8]">
      {/* Header */}
      <LinearGradient
        colors={['#1A3F75', '#1A3F75']}
        style={{ 
          paddingTop: Platform.OS === 'ios' ? insets.top : insets.top + 20, 
          paddingBottom: 24, 
          paddingHorizontal: 20 
        }}
      >
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View className="ml-4 flex-1">
            <Text className="text-white text-xl font-bold">Assigned Routes</Text>
            <Text className="text-white/80 text-xs mt-1">
              {isLockedToday
                ? 'Route locked for today'
                : hasMultipleRoutes
                  ? 'Select your route'
                  : 'View your assigned route'}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Locked Banner */}
      {isLockedToday && hasMultipleRoutes && (
        <View className="mx-4 mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex-row items-center">
          <View className="w-10 h-10 bg-amber-100 rounded-full items-center justify-center mr-3">
            <MaterialIcons name="lock" size={20} color="#D97706" />
          </View>
          <View className="flex-1">
            <Text className="text-amber-800 font-bold text-[13px]">Route Locked for Today</Text>
            <Text className="text-amber-600 text-[11px] mt-0.5">
              You've already selected your route. Changes available tomorrow.
            </Text>
          </View>
        </View>
      )}

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 16, paddingBottom: hasMultipleRoutes && !isLockedToday ? 120 : 40 }}
        showsVerticalScrollIndicator={false}
      >
        {routes.length === 0 ? (
          <View className="py-20 items-center">
            <View className="w-20 h-20 bg-gray-200 rounded-full items-center justify-center mb-4">
              <MaterialIcons name="alt-route" size={40} color="#9CA3AF" />
            </View>
            <Text className="text-gray-500 font-medium">No assigned routes yet</Text>
          </View>
        ) : (
          routes.map((route, idx) => {
            const isExpanded = expandedRoutes.has(route.id ?? idx);
            const isSelected = localSelectedId === route.id;
            const isCurrentlyActive = selectedRouteId === route.id;
            return (
              <View
                key={route.id || idx}
                className={`bg-white mb-4 rounded-2xl shadow-sm overflow-hidden ${
                  isSelected ? 'border-2 border-[#1A3F75]' : 'border border-gray-100'
                }`}
              >
                {/* Route Header Row - Always visible */}
                <TouchableOpacity
                  onPress={() => {
                    if (hasMultipleRoutes && !isLockedToday) {
                      handleSelectRoute(route.id);
                    } else if (isLockedToday && hasMultipleRoutes) {
                      handleSelectRoute(route.id); // Will show locked modal
                    }
                    toggleRoute(route.id ?? idx);
                  }}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 20,
                    paddingBottom: isExpanded ? 16 : 20,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
                    {/* Checkbox / Radio for multi-route */}
                    {hasMultipleRoutes && (
                      <TouchableOpacity
                        onPress={() => handleSelectRoute(route.id)}
                        className="mr-3"
                        disabled={isLockedToday}
                      >
                        <View
                          className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                            isSelected
                              ? 'border-[#1A3F75] bg-[#1A3F75]'
                              : isLockedToday
                                ? 'border-gray-200 bg-gray-100'
                                : 'border-gray-300 bg-white'
                          }`}
                        >
                          {isSelected && (
                            <Ionicons name="checkmark" size={16} color="white" />
                          )}
                        </View>
                      </TouchableOpacity>
                    )}
                    <View className="w-9 h-9 rounded-xl bg-[#F5F3FF] justify-center items-center mr-3">
                      <MaterialIcons name="alt-route" size={18} color="#7C3AED" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text className="text-[16px] font-extrabold text-gray-900" numberOfLines={1}>
                        {route.name}
                      </Text>
                      <Text className="text-[12px] font-medium text-gray-400 mt-0.5">
                        {route.areas?.length || 0} Areas
                      </Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {isCurrentlyActive && isLockedToday && (
                      <View className="bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 mr-2">
                        <Text className="text-[11px] font-bold text-amber-700 uppercase">
                          <MaterialIcons name="lock" size={10} color="#B45309" /> Locked
                        </Text>
                      </View>
                    )}
                    {isSelected && !isLockedToday && (
                      <View className="bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 mr-2">
                        <Text className="text-[11px] font-bold text-[#1A3F75] uppercase">Selected</Text>
                      </View>
                    )}
                    {isCurrentlyActive && isSelected && isLockedToday ? null : (
                      !isSelected && (
                        <View className="bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 mr-2">
                          <Text className="text-[11px] font-bold text-[#1A3F75] uppercase">Select</Text>
                        </View>
                      )
                    )}
                    <View style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: '#F3F4F6',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <MaterialIcons
                        name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                        size={20}
                        color="#64748B"
                      />
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Areas List - Collapsible */}
                {isExpanded && (
                  <View style={{ paddingHorizontal: 20, paddingBottom: 20, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 14 }}>
                    <Text className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                      Areas ({route.areas?.length || 0})
                    </Text>
                    
                    {!route.areas || route.areas.length === 0 ? (
                      <Text className="text-gray-500 text-sm italic">No areas listed for this route.</Text>
                    ) : (
                      <View className="flex-row flex-wrap gap-2">
                        {route.areas.map((area, aIdx) => (
                          <View
                            key={area.id || aIdx}
                            className="flex-row items-center bg-[#F3F4F6] px-3 py-1.5 rounded-xl border border-gray-200"
                          >
                            <MaterialIcons name="location-on" size={12} color="#64748B" />
                            <Text className="text-gray-700 text-xs font-bold ml-1">
                              {area.name}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Floating Submit Button - Only show when multiple routes, selection changed, and NOT locked */}
      {hasMultipleRoutes && hasChanges && !isLockedToday && (
        <View
          className="absolute left-0 right-0 px-6"
          style={{ bottom: insets.bottom + 30 }}
        >
          <TouchableOpacity
            className={`bg-[#1A3F75] py-4 rounded-2xl items-center shadow-xl ${isSubmitting ? 'opacity-70' : ''}`}
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={{
              shadowColor: '#1A3F75',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <View className="flex-row items-center">
                <MaterialIcons name="check-circle" size={20} color="white" />
                <Text className="text-white text-[15px] font-bold ml-2">
                  Confirm Route Selection
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}

      <StatusModal
        visible={modalConfig.visible}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        onClose={() => setModalConfig(prev => ({ ...prev, visible: false }))}
      />
    </View>
  );
}
