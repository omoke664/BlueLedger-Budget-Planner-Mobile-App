import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useCurrency, currencies } from '@/contexts/CurrencyContext';
import { useSmsListener } from '@/hooks/useSmsListener';
import * as SecureStore from 'expo-secure-store';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { selectedCurrency, setCurrency } = useCurrency();
  const { isListening, startSmsListener, stopSmsListener } = useSmsListener();
  
  const [notifications, setNotifications] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [showCurrencyDialog, setShowCurrencyDialog] = useState(false);
  const [smsListenerEnabled, setSmsListenerEnabled] = useState(isListening);

  useEffect(() => {
    const getSmsListenerState = async () => {
      const enabled = await SecureStore.getItemAsync('smsListenerEnabled');
      if (enabled) {
        const isEnabled = enabled === 'true';
        setSmsListenerEnabled(isEnabled);
        if (isEnabled) {
          startSmsListener();
        }
      }
    };
    getSmsListenerState();
  }, []);

  const handleSmsListenerToggle = async (value: boolean) => {
    setSmsListenerEnabled(value);
    if (value) {
      await startSmsListener();
    } else {
      stopSmsListener();
    }
    await SecureStore.setItemAsync('smsListenerEnabled', value.toString());
  };

  const handleCurrencyChange = (currency: any) => {
    setCurrency(currency);
    setShowCurrencyDialog(false);
  };

  const settingsGroups = [
    {
      title: 'Account',
      items: [
        { icon: 'person', label: 'Profile Information', hasChevron: true },
        { icon: 'camera', label: 'Change Profile Photo', hasChevron: true },
        { icon: 'shield', label: 'Security & Privacy', hasChevron: true },
      ]
    },
    {
      title: 'Financial Data',
      items: [
        { icon: 'cloud-upload', label: 'Upload Bank Statement', hasChevron: true },
        { icon: 'phone-portrait', label: 'Connected Sources', hasChevron: true },
        { icon: 'card', label: 'Payment Methods', hasChevron: true },
        { 
          icon: 'cash', 
          label: 'Currency', 
          hasChevron: true, 
          note: `${selectedCurrency.code} - ${selectedCurrency.name}`,
          onClick: () => setShowCurrencyDialog(true)
        },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { 
          icon: 'notifications', 
          label: 'Push Notifications', 
          hasSwitch: true, 
          value: notifications,
          onChange: setNotifications 
        },
        { 
          icon: 'shield', 
          label: 'Biometric Authentication', 
          hasSwitch: true, 
          value: biometric,
          onChange: setBiometric 
        },
        { 
          icon: 'phone-portrait', 
          label: 'Auto Sync', 
          hasSwitch: true, 
          value: autoSync,
          onChange: setAutoSync 
        },
        { 
          icon: 'chatbubbles', 
          label: 'M-Pesa SMS Listener', 
          hasSwitch: true, 
          value: smsListenerEnabled,
          onChange: handleSmsListenerToggle 
        },
        { icon: 'moon', label: 'Dark Mode', hasChevron: true, note: 'Always On' },
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: 'help-circle', label: 'Help & Support', hasChevron: true },
        { icon: 'cloud-download', label: 'Export Data', hasChevron: true },
        { icon: 'log-out', label: 'Sign Out', hasChevron: true, danger: true },
      ]
    }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        </View>

        {/* Profile Section */}
        <Card style={styles.profileCard}>
          <View style={styles.profileContent}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Ionicons name="person" size={32} color={colors.primaryForeground} />
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.text }]}>John Doe</Text>
              <Text style={[styles.profileEmail, { color: colors.mutedForeground }]}>
                john.doe@example.com
              </Text>
            </View>
            
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="pencil" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Settings Groups */}
        {settingsGroups.map((group, groupIndex) => (
          <View key={group.title} style={styles.settingsGroup}>
            <Text style={[styles.groupTitle, { color: colors.mutedForeground }]}>
              {group.title}
            </Text>
            
            <Card style={styles.groupCard}>
              {group.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.settingItem,
                    itemIndex < group.items.length - 1 && styles.settingItemBorder,
                    { borderBottomColor: colors.border }
                  ]}
                  onPress={item.onClick}
                  disabled={!item.onClick && !item.hasChevron}
                >
                  <View style={styles.settingLeft}>
                    <View style={[styles.settingIcon, { backgroundColor: colors.muted }]}>
                      <Ionicons name={item.icon as any} size={16} color={colors.text} />
                    </View>
                    
                    <View style={styles.settingInfo}>
                      <Text style={[styles.settingLabel, { color: colors.text }]}>
                        {item.label}
                      </Text>
                      {item.note && (
                        <Text style={[styles.settingNote, { color: colors.mutedForeground }]}>
                          {item.note}
                        </Text>
                      )}
                    </View>
                  </View>
                  
                  <View style={styles.settingRight}>
                    {item.hasSwitch && (
                      <Switch
                        value={item.value}
                        onValueChange={item.onChange}
                        trackColor={{ false: colors.muted, true: colors.primary }}
                        thumbColor={colors.background}
                      />
                    )}
                    
                    {item.hasChevron && (
                      <Ionicons 
                        name="chevron-forward" 
                        size={16} 
                        color={item.danger ? colors.destructive : colors.mutedForeground} 
                      />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        ))}

        {/* Currency Dialog */}
        {showCurrencyDialog && (
          <View style={styles.currencyDialog}>
            <Card style={styles.currencyDialogContent}>
              <Text style={[styles.currencyDialogTitle, { color: colors.text }]}>
                Select Currency
              </Text>
              
              {currencies.map((currency) => (
                <TouchableOpacity
                  key={currency.code}
                  style={[
                    styles.currencyOption,
                    selectedCurrency.code === currency.code && { backgroundColor: colors.primary }
                  ]}
                  onPress={() => handleCurrencyChange(currency)}
                >
                  <Text style={[
                    styles.currencyOptionText,
                    { color: selectedCurrency.code === currency.code ? colors.primaryForeground : colors.text }
                  ]}>
                    {currency.symbol} - {currency.name} ({currency.code})
                  </Text>
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: colors.card }]}
                onPress={() => setShowCurrencyDialog(false)}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
            </Card>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileCard: {
    margin: 16,
    marginTop: 8,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
  },
  editButton: {
    padding: 8,
  },
  settingsGroup: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  groupCard: {
    marginHorizontal: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingNote: {
    fontSize: 12,
    marginTop: 2,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyDialog: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  currencyDialogContent: {
    width: '100%',
    maxWidth: 300,
    padding: 16,
  },
  currencyDialogTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  currencyOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  currencyOptionText: {
    fontSize: 16,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
