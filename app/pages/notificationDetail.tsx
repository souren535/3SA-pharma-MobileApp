import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function NotificationDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();

  const title = params.title as string || 'Notification';
  const message = params.message as string || '';
  const targetType = params.targetType as string || '';
  const createdAt = params.createdAt as string || '';
  const isRead = params.isRead === 'true';

  const getIconDetails = () => {
    switch (targetType?.toLowerCase()) {
      case 'order':
        return { icon: 'shopping-cart', bgColor: '#EFF6FF', iconColor: '#1A3F75' };
      case 'warning':
      case 'alert':
        return { icon: 'warning', bgColor: '#FEF2F2', iconColor: '#DC2626' };
      case 'announcement':
      case 'broadcast':
        return { icon: 'campaign', bgColor: '#FFFBEB', iconColor: '#D97706' };
      default:
        return { icon: 'notifications', bgColor: '#F0F9FF', iconColor: '#0284C7' };
    }
  };

  const iconDetails = getIconDetails();

  const formattedDate = createdAt ? new Date(createdAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) : '';

  return (
    <View style={{ flex: 1, backgroundColor: '#F3F6F8' }}>
      {/* Header */}
      <LinearGradient
        colors={['#1A3F75', '#1A3F75']}
        style={{
          paddingTop: Platform.OS === 'ios' ? insets.top : insets.top + 20,
          paddingBottom: 24,
          paddingHorizontal: 20,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={{ marginLeft: 16, flex: 1 }}>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>
              Notification Details
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4 }}>
              View full notification
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Icon + Type Badge */}
        <View style={{ alignItems: 'center', marginBottom: 24, marginTop: 12 }}>
          <View style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: iconDetails.bgColor,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}>
            <MaterialIcons
              name={iconDetails.icon as any}
              size={32}
              color={iconDetails.iconColor}
            />
          </View>
          {targetType ? (
            <View style={{
              backgroundColor: iconDetails.bgColor,
              paddingHorizontal: 16,
              paddingVertical: 6,
              borderRadius: 20,
            }}>
              <Text style={{
                fontSize: 12,
                fontWeight: '700',
                color: iconDetails.iconColor,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}>
                {targetType}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Content Card */}
        <View style={{
          backgroundColor: '#fff',
          borderRadius: 20,
          padding: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}>
          {/* Title */}
          <Text style={{
            fontSize: 20,
            fontWeight: '800',
            color: '#1E293B',
            marginBottom: 16,
            lineHeight: 28,
          }}>
            {title}
          </Text>

          {/* Divider */}
          <View style={{ height: 1, backgroundColor: '#F1F5F9', marginBottom: 16 }} />

          {/* Message */}
          <Text style={{
            fontSize: 15,
            color: '#475569',
            lineHeight: 24,
            marginBottom: 20,
          }}>
            {message}
          </Text>

          {/* Date */}
          {formattedDate ? (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#F8FAFC',
              padding: 14,
              borderRadius: 14,
            }}>
              <MaterialIcons name="access-time" size={18} color="#94A3B8" />
              <Text style={{
                fontSize: 13,
                color: '#64748B',
                fontWeight: '600',
                marginLeft: 10,
              }}>
                {formattedDate}
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
