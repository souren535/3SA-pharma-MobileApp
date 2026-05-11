import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Image, Modal, TextInput, Animated } from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const storeOrders = [
  { id: 1, type: 'Order', orderNo: 'ABC12345', billingDate: '04 APR 2026', amount: '+ Rs. 5700', isOrder: true },
  { id: 2, type: 'Payment', date: '04 APR 2026', desc: 'Cash payment received', amount: '- Rs. 3000', isOrder: false },
  { id: 3, type: 'Order', orderNo: 'ABC12346', billingDate: '10 APR 2026', amount: '+ Rs. 3200', isOrder: true },
  { id: 4, type: 'Payment', date: '12 APR 2026', desc: 'UPI payment received', amount: '- Rs. 5700', isOrder: false },
  { id: 5, type: 'Order', orderNo: 'ABC12347', billingDate: '15 APR 2026', amount: '+ Rs. 4100', isOrder: true },
];

const storeTransactions = [
  { id: 1, date: '04 APR 2026', type: 'Credit', amount: '+ Rs. 5700', desc: 'Order #ABC12345', balance: 'Rs. 5700' },
  { id: 2, date: '06 APR 2026', type: 'Debit', amount: '- Rs. 3000', desc: 'Cash Payment', balance: 'Rs. 2700' },
  { id: 3, date: '10 APR 2026', type: 'Credit', amount: '+ Rs. 3200', desc: 'Order #ABC12346', balance: 'Rs. 5900' },
  { id: 4, date: '12 APR 2026', type: 'Debit', amount: '- Rs. 5700', desc: 'UPI Payment', balance: 'Rs. 200' },
  { id: 5, date: '15 APR 2026', type: 'Credit', amount: '+ Rs. 4100', desc: 'Order #ABC12347', balance: 'Rs. 4300' },
];

type TabName = 'Orders' | 'Transaction' | 'Info';

export default function StoreInfoScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<TabName>('Orders');
  const [transactionFilter, setTransactionFilter] = useState<'All' | 'Credit' | 'Debit'>('All');

  // FAB animation and states
  const [isFabOpen, setIsFabOpen] = useState(false);
  const fabAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(fabAnimation, {
      toValue: isFabOpen ? 1 : 0,
      useNativeDriver: true,
      friction: 5,
      tension: 40,
    }).start();
  }, [isFabOpen]);

  const fabMenuTranslateY = fabAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });
  const fabMenuOpacity = fabAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  // Modal states
  const [showVisitNoteModal, setShowVisitNoteModal] = useState(false);
  const [visitNoteText, setVisitNoteText] = useState('');
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [showFilterPopup, setShowFilterPopup] = useState(false);

  // Create Transaction states
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transDate, setTransDate] = useState(() => {
    const today = new Date();
    return `${today.getDate().toString().padStart(2, '0')} ${today.toLocaleString('default', { month: 'short' }).toUpperCase()} ${today.getFullYear()}`;
  });
  const [transAmount, setTransAmount] = useState('');
  const [transMode, setTransMode] = useState('Cash');
  const [showTransModePicker, setShowTransModePicker] = useState(false);
  const [transNote, setTransNote] = useState('');

  const showPopup = (title: string, message: string) => {
    setPopupTitle(title);
    setPopupMessage(message);
    setPopupVisible(true);
  };

  const storeName = (params.storeName as string) || 'Krishna Medical Stores';
  const storeCategory = (params.storeCategory as string) || 'Medicine Shop';
  const storeContact = (params.storeContact as string) || '+91 9876543210';
  const storeImage = (params.storeImage as string) || 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?q=80&w=400&auto=format&fit=crop';

  const tabs: TabName[] = ['Orders', 'Transaction', 'Info'];

  const renderOrders = () => (
    <>
      {storeOrders.map((item) => (
        <TouchableOpacity key={item.id} className="bg-white mx-4 mb-3 p-4 rounded-xl shadow-sm flex-row items-center">
          <View className={`w-11 h-11 rounded-full items-center justify-center ${item.isOrder ? 'bg-[#FF7676]' : 'bg-[#47B8A0]'}`}>
            <Text className="text-white text-lg font-bold">{item.type.charAt(0)}</Text>
          </View>
          <View className="flex-1 ml-3">
            <View className="flex-row justify-between items-start">
              <Text className="text-[14px] font-bold text-gray-800">{item.type}</Text>
              <Text className={`text-xs font-bold ${item.isOrder ? 'text-[#FF4A4A]' : 'text-[#3AA58E]'}`}>{item.amount}</Text>
            </View>
            <Text className="text-xs text-gray-500 mt-0.5">
              {item.isOrder ? `Order No : ${item.orderNo}` : `Date : ${item.date}`}
            </Text>
            {item.isOrder ? (
              <Text className="text-xs text-gray-500 mt-0.5">Billing Date : {item.billingDate}</Text>
            ) : (
              <Text className="text-xs text-gray-500 mt-0.5">{item.desc}</Text>
            )}
          </View>
          <Ionicons name="caret-forward" size={14} color="#A0AEC0" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      ))}
    </>
  );

  const renderTransactions = () => {
    const filteredTransactions = storeTransactions.filter((t) => transactionFilter === 'All' || t.type === transactionFilter);

    return (
      <View className="mx-4">
        {/* Improved Summary */}
        <View className="bg-white rounded-2xl shadow-sm mb-5">
          <LinearGradient
            colors={['#1A3F75', '#2D5A9E']}
            className="rounded-t-2xl p-4 flex-row justify-between items-center"
          >
            <Text className="text-white text-lg font-bold">Financial Summary</Text>
            <Ionicons name="stats-chart" size={20} color="white" />
          </LinearGradient>

          <View className="p-4 flex-row flex-wrap">
            <View className="w-[50%] p-2">
              <Text className="text-xs text-gray-500 mb-1">Total Orders</Text>
              <Text className="text-base font-bold text-gray-800">24</Text>
            </View>
            <View className="w-[50%] p-2 border-l border-gray-100">
              <Text className="text-xs text-gray-500 mb-1">Total Amount</Text>
              <Text className="text-base font-bold text-[#16A34A]">Rs. 1,45,600</Text>
            </View>
            <View className="w-[50%] p-2 border-t border-gray-100">
              <Text className="text-xs text-gray-500 mb-1">Total Paid</Text>
              <Text className="text-base font-bold text-[#4C73B6]">Rs. 1,20,300</Text>
            </View>
            <View className="w-[50%] p-2 border-t border-l border-gray-100">
              <Text className="text-xs text-gray-500 mb-1">Outstanding</Text>
              <Text className="text-base font-bold text-[#DC2626]">Rs. 25,300</Text>
            </View>
          </View>
        </View>

        {/* Filter Bar */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="font-bold text-gray-800 text-base">Transactions</Text>
          <TouchableOpacity
            className="flex-row items-center bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-200"
            onPress={() => setShowFilterPopup(true)}
          >
            <Ionicons name="filter" size={16} color="#1A3F75" />
            <Text className="text-[#1A3F75] font-semibold text-xs ml-1">
              Filter: {transactionFilter}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Transactions List */}
        {filteredTransactions.map((item) => (
          <View key={item.id} className="bg-white mb-3 p-4 rounded-xl shadow-sm">
            <View className="flex-row justify-between items-center mb-2">
              <View className="flex-row items-center">
                <View className={`w-8 h-8 rounded-full items-center justify-center ${item.type === 'Credit' ? 'bg-[#DCFCE7]' : 'bg-[#FEE2E2]'}`}>
                  <Ionicons
                    name={item.type === 'Credit' ? 'arrow-down' : 'arrow-up'}
                    size={16}
                    color={item.type === 'Credit' ? '#16A34A' : '#DC2626'}
                  />
                </View>
                <View className="ml-3">
                  <Text className="text-[14px] font-bold text-gray-800">{item.type}</Text>
                  <Text className="text-[11px] text-gray-400 mt-0.5">{item.date}</Text>
                </View>
              </View>
              <Text className={`text-sm font-bold ${item.type === 'Credit' ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>{item.amount}</Text>
            </View>
            <View className="flex-row justify-between items-center pt-2 border-t border-gray-100">
              <Text className="text-xs text-gray-500">{item.desc}</Text>
              <Text className="text-xs text-gray-600 font-semibold">Bal: {item.balance}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderInfo = () => (
    <View className="mx-4">
      {/* Store Image */}
      <View className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
        <Image
          source={{ uri: storeImage }}
          className="w-full h-[180px]"
          resizeMode="cover"
        />
      </View>

      {/* Store Details */}
      <View className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <Text className="text-lg font-bold text-gray-800 mb-3">Store Details</Text>

        <View className="flex-row items-center mb-3">
          <View className="w-9 h-9 rounded-full bg-[#EEF2FF] items-center justify-center">
            <MaterialIcons name="store" size={18} color="#4C73B6" />
          </View>
          <View className="ml-3">
            <Text className="text-[11px] text-gray-400">Store Name</Text>
            <Text className="text-[14px] font-semibold text-gray-800">{storeName}</Text>
          </View>
        </View>

        <View className="flex-row items-center mb-3">
          <View className="w-9 h-9 rounded-full bg-[#FEF3C7] items-center justify-center">
            <MaterialIcons name="category" size={18} color="#D97706" />
          </View>
          <View className="ml-3">
            <Text className="text-[11px] text-gray-400">Category</Text>
            <Text className="text-[14px] font-semibold text-gray-800">{storeCategory}</Text>
          </View>
        </View>

        <View className="flex-row items-center mb-3">
          <View className="w-9 h-9 rounded-full bg-[#DCFCE7] items-center justify-center">
            <MaterialIcons name="phone" size={18} color="#16A34A" />
          </View>
          <View className="ml-3">
            <Text className="text-[11px] text-gray-400">Contact</Text>
            <Text className="text-[14px] font-semibold text-gray-800">{storeContact}</Text>
          </View>
        </View>

        <View className="flex-row items-center">
          <View className="w-9 h-9 rounded-full bg-[#FEE2E2] items-center justify-center">
            <MaterialIcons name="location-on" size={18} color="#DC2626" />
          </View>
          <View className="ml-3">
            <Text className="text-[11px] text-gray-400">Address</Text>
            <Text className="text-[14px] font-semibold text-gray-800">123, Main Road, City Center</Text>
          </View>
        </View>
      </View>

    </View>
  );

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <LinearGradient
        colors={['#1A3F75', '#2D5A9E']}
        style={{ paddingTop: Platform.OS === 'ios' ? insets.top : insets.top + 20, paddingBottom: 0, paddingHorizontal: 20 }}
      >
        {/* Top Bar */}
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity className='bg-white/20 rounded-full p-2' onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View className="ml-4 flex-1">
              <Text className="text-white text-lg font-bold" numberOfLines={1}>{storeName}</Text>
              <Text className="text-white/70 text-xs mt-0.5">{storeCategory}</Text>
            </View>
          </View>
          <View className="flex-row gap-3">
            <TouchableOpacity className="w-9 h-9 bg-white/20 rounded-full items-center justify-center">
              <Ionicons name="call" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row">
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className="flex-1 items-center pb-3"
            >
              <Text className={`text-sm font-bold ${activeTab === tab ? 'text-white' : 'text-white/50'}`}>{tab}</Text>
              {activeTab === tab && (
                <View className="absolute bottom-0 w-full h-[3px] bg-white rounded-full" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {/* Scrollable Content */}
      <ScrollView className="flex-1" contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {activeTab === 'Orders' && renderOrders()}
        {activeTab === 'Transaction' && renderTransactions()}
        {activeTab === 'Info' && renderInfo()}
      </ScrollView>

      {/* Animated FAB Menu Background Overlay (Only for Orders) */}
      {activeTab === 'Orders' && isFabOpen && (
        <TouchableOpacity
          className="absolute top-0 bottom-0 left-0 right-0 bg-black/20"
          activeOpacity={1}
          onPress={() => setIsFabOpen(false)}
        />
      )}

      {/* FAB Options (Only for Orders) */}
      {activeTab === 'Orders' && (
        <Animated.View
          className="absolute bottom-[100px] right-6 items-end gap-3"
          style={{
            transform: [{ translateY: fabMenuTranslateY }],
            opacity: fabMenuOpacity,
          }}
          pointerEvents={isFabOpen ? 'box-none' : 'none'}
        >
          <TouchableOpacity
            className="flex-row items-center bg-white py-2 px-4 rounded-full shadow-md"
            onPress={() => {
              setIsFabOpen(false);
              router.push({ pathname: '/pages/orderCreate', params: { storeName, storeCategory, storeContact, storeImage, fromStore: 'true' } });
            }}
          >
            <Text className="mr-2 text-[#1A3F75] font-bold">Create Order</Text>
            <View className="w-10 h-10 bg-[#1A3F75] rounded-full items-center justify-center">
              <MaterialIcons name="add-shopping-cart" size={20} color="white" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center bg-white py-2 px-4 rounded-full shadow-md"
            onPress={() => {
              setIsFabOpen(false);
              setShowVisitNoteModal(true);
            }}
          >
            <Text className="mr-2 text-[#1A3F75] font-bold">Visit Note</Text>
            <View className="w-10 h-10 bg-[#1A3F75] rounded-full items-center justify-center">
              <MaterialIcons name="note-add" size={20} color="white" />
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Main FAB (Hidden on Info tab) */}
      {activeTab !== 'Info' && (
        <TouchableOpacity
          className="absolute bottom-10 right-6 w-14 h-14 bg-[#1A3F75] rounded-2xl items-center justify-center shadow-lg elevation-5"
          onPress={() => {
            if (activeTab === 'Orders') {
              setIsFabOpen(!isFabOpen);
            } else if (activeTab === 'Transaction') {
              setShowTransactionModal(true);
            }
          }}
        >
          {activeTab === 'Orders' ? (
            <Feather name={isFabOpen ? "x" : "plus"} size={26} color="white" />
          ) : (
            <Feather name="plus" size={26} color="white" />
          )}
        </TouchableOpacity>
      )}

      {/* ===== CREATE TRANSACTION MODAL ===== */}
      <Modal visible={showTransactionModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6" style={{ paddingBottom: Platform.OS === 'ios' ? insets.bottom + 20 : 30 }}>
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-lg font-bold text-gray-800">Create New Transaction</Text>
              <TouchableOpacity onPress={() => setShowTransactionModal(false)}>
                <Ionicons name="close-circle" size={28} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Text className="text-xs font-bold text-gray-400 uppercase mb-1.5">Date</Text>
              <TextInput
                className="bg-gray-50 rounded-xl p-3.5 text-[14px] text-gray-800 border border-gray-100"
                value={transDate}
                onChangeText={setTransDate}
                placeholder="DD MMM YYYY"
              />
            </View>

            <View className="mb-4">
              <Text className="text-xs font-bold text-gray-400 uppercase mb-1.5">Amount (Rs.)</Text>
              <TextInput
                className="bg-gray-50 rounded-xl p-3.5 text-[14px] text-gray-800 border border-gray-100"
                value={transAmount}
                onChangeText={(t) => setTransAmount(t.replace(/[^0-9.]/g, ''))}
                placeholder="Enter amount"
                keyboardType="numeric"
              />
            </View>

            <View className="mb-4">
              <Text className="text-xs font-bold text-gray-400 uppercase mb-1.5">Payment Method / Mode</Text>
              <TouchableOpacity
                className="flex-row justify-between items-center bg-gray-50 rounded-xl p-3.5 border border-gray-100"
                onPress={() => setShowTransModePicker(true)}
              >
                <Text className="text-[14px] text-gray-800">{transMode}</Text>
                <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <View className="mb-6">
              <Text className="text-xs font-bold text-gray-400 uppercase mb-1.5">Note</Text>
              <TextInput
                className="bg-gray-50 rounded-xl p-3.5 text-[14px] text-gray-800 border border-gray-100"
                value={transNote}
                onChangeText={setTransNote}
                placeholder="Brief description..."
              />
            </View>

            <TouchableOpacity
              className="bg-[#1A3F75] py-4 rounded-2xl items-center shadow-md"
              onPress={() => {
                if (!transAmount) {
                  showPopup('Required', 'Please enter a transaction amount.');
                  return;
                }
                setShowTransactionModal(false);
                setTransAmount('');
                setTransNote('');
                showPopup('Success', 'Transaction saved successfully!');
              }}
            >
              <Text className="text-white text-[15px] font-bold">Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ===== PAYMENT MODE PICKER MODAL ===== */}
      <Modal visible={showTransModePicker} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6" style={{ paddingBottom: Platform.OS === 'ios' ? insets.bottom + 20 : 30 }}>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-gray-800">Select Payment Mode</Text>
              <TouchableOpacity onPress={() => setShowTransModePicker(false)}>
                <Ionicons name="close-circle" size={28} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            {['Cash', 'UPI', 'Bank Transfer', 'Cheque'].map((mode) => (
              <TouchableOpacity
                key={mode}
                className={`flex-row justify-between items-center p-4 rounded-xl mb-3 ${transMode === mode ? 'bg-[#EFF6FF]' : 'bg-gray-50'}`}
                onPress={() => {
                  setTransMode(mode);
                  setShowTransModePicker(false);
                }}
              >
                <Text className={`font-bold ${transMode === mode ? 'text-[#1A3F75]' : 'text-gray-600'}`}>{mode}</Text>
                {transMode === mode && <Ionicons name="checkmark-circle" size={24} color="#1A3F75" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* ===== FILTER MODAL ===== */}
      <Modal visible={showFilterPopup} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6" style={{ paddingBottom: Platform.OS === 'ios' ? insets.bottom + 20 : 30 }}>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-gray-800">Filter Transactions</Text>
              <TouchableOpacity onPress={() => setShowFilterPopup(false)}>
                <Ionicons name="close-circle" size={28} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {['All', 'Credit', 'Debit'].map((filter) => (
              <TouchableOpacity
                key={filter}
                className={`flex-row justify-between items-center p-4 rounded-xl mb-3 ${transactionFilter === filter ? 'bg-[#EFF6FF]' : 'bg-gray-50'}`}
                onPress={() => {
                  setTransactionFilter(filter as 'All' | 'Credit' | 'Debit');
                  setShowFilterPopup(false);
                }}
              >
                <Text className={`font-bold ${transactionFilter === filter ? 'text-[#1A3F75]' : 'text-gray-600'}`}>{filter}</Text>
                {transactionFilter === filter && <Ionicons name="checkmark-circle" size={24} color="#1A3F75" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* ===== VISIT NOTE MODAL ===== */}
      <Modal visible={showVisitNoteModal} animationType="fade" transparent>
        <View className="flex-1 bg-black/50 justify-center items-center px-5">
          <View className="bg-white rounded-3xl w-full p-6 shadow-xl">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-gray-800">Add Visit Note</Text>
              <TouchableOpacity onPress={() => { setShowVisitNoteModal(false); setVisitNoteText(''); }}>
                <Ionicons name="close-circle" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <TextInput
              className="bg-gray-50 rounded-xl p-4 text-[14px] text-gray-800 border border-gray-200 mb-4"
              placeholder="Type your visit note here..."
              placeholderTextColor="#9CA3AF"
              value={visitNoteText}
              onChangeText={setVisitNoteText}
              multiline
              numberOfLines={4}
              style={{ minHeight: 100, textAlignVertical: "top" }}
              autoFocus
            />

            <TouchableOpacity
              className="bg-[#1A3F75] py-3.5 rounded-2xl items-center shadow-md"
              onPress={() => {
                if (visitNoteText.trim()) {
                  console.log('Visit Note:', visitNoteText);
                  setShowVisitNoteModal(false);
                  setVisitNoteText('');
                  showPopup('Success', 'Visit note submitted successfully!');
                } else {
                  showPopup('Required', 'Please enter a visit note before submitting.');
                }
              }}
            >
              <Text className="text-white text-[15px] font-bold">Submit Note</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ===== POPUP MODAL ===== */}
      <Modal visible={popupVisible} animationType="fade" transparent>
        <View className="flex-1 bg-black/50 justify-center items-center px-8">
          <View className="bg-white rounded-3xl w-full p-6 items-center shadow-xl">
            <View
              className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${
                popupTitle === 'Success' ? 'bg-[#ECFDF5]' : 'bg-[#FEF2F2]'
              }`}
            >
              <Ionicons
                name={popupTitle === 'Success' ? 'checkmark-circle' : 'alert-circle'}
                size={32}
                color={popupTitle === 'Success' ? '#059669' : '#DC2626'}
              />
            </View>
            <Text className="text-[18px] font-bold text-gray-800 mb-2 text-center">{popupTitle}</Text>
            <Text className="text-[14px] text-gray-500 text-center mb-6 leading-5">{popupMessage}</Text>
            <TouchableOpacity
              className="w-full py-3.5 rounded-2xl bg-[#1A3F75] items-center"
              onPress={() => setPopupVisible(false)}
            >
              <Text className="text-white font-bold text-[14px]">OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6F8',
  },
});
