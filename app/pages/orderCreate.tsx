import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  TextInput,
  Image,
  Modal,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useShopStore, useOrderStore, useProductStore, IMAGE_BASE_URL } from "../../store/store";
import { StatusModal } from "../../components/ui/status-modal";

interface CartItem {
  id: number;
  name: string;
  brand: string;
  qty: number;
}

export default function OrderCreateScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();

  const fromStore = params.fromStore === "true";
  const storeIdParam = params.storeId as string;
  const preSelectedStore = fromStore ? (params.storeName as string) : "";
  const storeCategory = (params.storeCategory as string) || "";
  const storeContact = (params.storeContact as string) || "";
  const storeImage = (params.storeImage as string) || "";

  // Zustand stores
  const { shops, fetchShops } = useShopStore();
  const { createOrder, isLoading: isOrderSubmitting } = useOrderStore();
  const { products, fetchProducts, categories, fetchCategories, isLoading: productsLoading } = useProductStore();

  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(storeIdParam ? parseInt(storeIdParam) : null);
  const [selectedStoreName, setSelectedStoreName] = useState(preSelectedStore);
  
  const [showStoreDropdown, setShowStoreDropdown] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [modalSearch, setModalSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [deliveryDate, setDeliveryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [modalConfig, setModalConfig] = useState({ visible: false, type: 'info' as 'success'|'error'|'info', title: '', message: '' });

  useEffect(() => {
    fetchShops();
    fetchProducts();
    fetchCategories();
  }, []);

  const selectedStoreData = shops.find((s) => s.id === selectedStoreId);

  const filteredModalProducts = useMemo(() => {
    return products.filter((p) => {
      const brandName = p.brand?.name || "";
      const matchesSearch = p.product_name.toLowerCase().includes(modalSearch.toLowerCase()) || 
                           brandName.toLowerCase().includes(modalSearch.toLowerCase());
      const matchesCategory = selectedCategoryId ? (p.brand?.category_id === selectedCategoryId || p.category_id === selectedCategoryId) : true;
      return matchesSearch && matchesCategory;
    });
  }, [products, modalSearch, selectedCategoryId]);

  const toggleProduct = (product: any) => {
    const existing = cart.find((c) => c.id === product.id);
    if (existing) {
      setCart(cart.filter((c) => c.id !== product.id));
    } else {
      setCart([...cart, { id: product.id, name: product.product_name, brand: product.brand?.name || "", qty: 1 }]);
    }
  };

  const updateQty = (id: number, delta: number) => {
    setCart(
      cart.map((c) =>
        c.id === id ? { ...c, qty: Math.max(1, c.qty + delta) } : c,
      ),
    );
  };

  const handlePlaceOrder = async () => {
    if (!selectedStoreId && !storeIdParam) {
      setModalConfig({ visible: true, type: 'error', title: 'Error', message: 'Please select a store' });
      return;
    }
    if (cart.length === 0) {
      setModalConfig({ visible: true, type: 'error', title: 'Error', message: 'Please add at least one product' });
      return;
    }

    const payload = {
      shop_id: selectedStoreId || parseInt(storeIdParam),
      items: cart.map(item => ({
        product_id: item.id,
        quantity: item.qty
      })),
      notes: note
    };

    try {
      await createOrder(payload);
      setModalConfig({ visible: true, type: 'success', title: 'Success', message: 'Order placed successfully!' });
      setTimeout(() => router.back(), 1500);
    } catch (error) {
      setModalConfig({ visible: true, type: 'error', title: 'Failed', message: 'Failed to place order. Please try again.' });
    }
  };

  const getStoreImageUrl = (item: any) => {
    if (!item) return 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?q=80&w=200&auto=format&fit=crop';
    if (item.images && item.images.length > 0) {
      const url = item.images[0].image_url;
      return url.startsWith('http') ? url : `${IMAGE_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
    }
    return 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?q=80&w=200&auto=format&fit=crop';
  };

  const renderStoreProfileCard = () => {
    const name = fromStore ? preSelectedStore : selectedStoreName;
    const cat = fromStore ? storeCategory : selectedStoreData?.category || "";
    const phone = fromStore ? storeContact : selectedStoreData?.contact || "";
    const addr = fromStore ? "Address from parameters" : selectedStoreData?.address || "";
    const img = fromStore ? storeImage : getStoreImageUrl(selectedStoreData);

    if (!name) return null;

    return (
      <View className="bg-white mx-4 mt-4 rounded-2xl shadow-sm p-4">
        <View className="flex-row">
          <Image
            source={{ uri: img }}
            className="w-[72px] h-[72px] rounded-xl bg-gray-200"
            resizeMode="cover"
          />
          <View className="flex-1 ml-4 justify-center">
            <Text className="text-[16px] font-bold text-gray-800">{name}</Text>
            <View className="flex-row items-center mt-3">
              <MaterialIcons name="category" size={15} color="#9CA3AF" />
              <Text className="text-[12px] text-gray-500 ml-2">{cat}</Text>
            </View>
            <View className="flex-row items-center mt-2">
              <MaterialIcons name="phone" size={15} color="#9CA3AF" />
              <Text className="text-[12px] text-gray-500 ml-2">{phone}</Text>
            </View>
          </View>
        </View>

        <View className="h-[1px] bg-gray-100 my-3" />
        <View className="flex-row items-start">
          <MaterialIcons
            name="location-on"
            size={15}
            color="#9CA3AF"
            style={{ marginTop: 2 }}
          />
          <Text className="text-[12px] text-gray-500 ml-2 flex-1" numberOfLines={2}>{selectedStoreData?.address || addr}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#1A3F75", "#2D5A9E"]}
        style={{
          paddingTop: Platform.OS === "ios" ? insets.top : insets.top + 20,
          paddingBottom: 20,
          paddingHorizontal: 20,
        }}
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View className="ml-4">
              <Text className="text-white text-lg font-bold">Create Order</Text>
              <Text className="text-white/70 text-xs mt-0.5">
                {fromStore ? `For ${preSelectedStore}` : "New Order"}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View className="z-10 pb-1">
        {/* Store Selector */}
        {!fromStore && (
          <View className="mx-4 mt-4">
            <Text className="text-xs font-bold text-gray-400 uppercase mb-2 ml-1">
              Select Store
            </Text>
            <TouchableOpacity
              className="bg-white rounded-xl p-4 shadow-sm flex-row items-center justify-between"
              onPress={() => setShowStoreDropdown(!showStoreDropdown)}
            >
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 rounded-full bg-[#EEF2FF] items-center justify-center">
                  <MaterialIcons name="store" size={20} color="#4C73B6" />
                </View>
                <Text
                  className={`ml-3 text-[14px] font-semibold ${selectedStoreName ? "text-gray-800" : "text-gray-400"}`}
                >
                  {selectedStoreName || "Choose a store..."}
                </Text>
              </View>
              <Ionicons
                name={showStoreDropdown ? "chevron-up" : "chevron-down"}
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>
            {showStoreDropdown && (
              <ScrollView
                className="bg-white rounded-xl shadow-md mt-1"
                style={{ maxHeight: 200 }}
                nestedScrollEnabled
              >
                {shops.map((store) => (
                  <TouchableOpacity
                    key={store.id}
                    className={`flex-row items-center px-4 py-3 border-b border-gray-50 ${selectedStoreId === store.id ? "bg-[#EEF2FF]" : ""}`}
                    onPress={() => {
                      setSelectedStoreId(store.id);
                      setSelectedStoreName(store.shop_name);
                      setShowStoreDropdown(false);
                    }}
                  >
                    <Image
                      source={{ uri: getStoreImageUrl(store) }}
                      className="w-9 h-9 rounded-full bg-gray-200"
                      resizeMode="cover"
                    />
                    <View className="ml-3 flex-1">
                      <Text className="text-[13px] font-semibold text-gray-800">
                        {store.shop_name}
                      </Text>
                      <Text className="text-[11px] text-gray-400">
                        {store.category}
                      </Text>
                    </View>
                    {selectedStoreId === store.id && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#4C73B6"
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        )}

        {/* Store Profile Card */}
        {renderStoreProfileCard()}

        {/* Note + Delivery Date Row */}
        {(selectedStoreName || fromStore) && (
          <View className="flex-row mx-4 mt-4 gap-3">
            <View className="flex-1 bg-white rounded-xl shadow-sm p-3">
              <Text className="text-[10px] font-bold text-gray-400 uppercase mb-1.5">
                Note
              </Text>
              <TextInput
                placeholder="Add a note..."
                placeholderTextColor="#9CA3AF"
                className="text-[13px] text-gray-700"
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={2}
                style={{ minHeight: 40, textAlignVertical: "top" }}
              />
            </View>
            <View className="flex-1 bg-white rounded-xl shadow-sm p-3">
              <Text className="text-[10px] font-bold text-gray-400 uppercase mb-1.5">
                Delivery Date
              </Text>
              <TouchableOpacity 
                className="flex-row items-center mt-1"
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={18} color="#4C73B6" />
                <Text className="text-[13px] text-gray-700 font-semibold ml-2">
                  {deliveryDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {showDatePicker && (
          <DateTimePicker
            value={deliveryDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDeliveryDate(selectedDate);
            }}
          />
        )}

        {/* Select Product Button */}
        {(selectedStoreName || fromStore) && (
          <View className="mx-4 mt-5">
            <Text className="text-xs font-bold text-gray-400 uppercase mb-2 ml-1">
              Select Products
            </Text>
            <TouchableOpacity
              className="bg-white rounded-xl p-4 flex-row items-center justify-between shadow-sm border border-gray-100"
              onPress={() => setShowProductModal(true)}
            >
              <View className="flex-row items-center flex-1">
                <Text className="text-[#9CA3AF] text-[14px] ml-3">
                  Search for product...
                </Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: cart.length > 0 ? 180 : 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Selected Product List */}
        {cart.length > 0 && (
          <View className="mx-4 mt-5">
            <Text className="text-xs font-bold text-gray-400 uppercase mb-2 ml-1">
              Product List ({cart.length})
            </Text>
            {cart.map((item) => (
              <View
                key={item.id}
                className="bg-white rounded-xl shadow-sm p-3 mb-3 flex-row items-center"
              >
                <View className="flex-1 ml-1">
                  <Text
                    className="text-[14px] font-bold text-gray-800"
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <Text className="text-[12px] text-gray-500 mt-1">
                    {item.brand}
                  </Text>
                </View>
                <View className="flex-row items-center bg-[#EEF2FF] rounded-xl px-1">
                  <TouchableOpacity
                    className="w-7 h-7 items-center justify-center"
                    onPress={() => updateQty(item.id, -1)}
                  >
                    <Feather name="minus" size={14} color="#4C73B6" />
                  </TouchableOpacity>
                  <Text className="text-[14px] font-bold text-[#1A3F75] mx-2">
                    {item.qty}
                  </Text>
                  <TouchableOpacity
                    className="w-7 h-7 items-center justify-center"
                    onPress={() => updateQty(item.id, 1)}
                  >
                    <Feather name="plus" size={14} color="#4C73B6" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom Submit Bar */}
      {cart.length > 0 && (selectedStoreName || fromStore) && (
        <View
          className="absolute bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-100"
          style={{ paddingBottom: Platform.OS === "ios" ? insets.bottom : 16 }}
        >
          <View className="flex-row items-center justify-between px-5 pt-4 pb-2">
            <View>
              <Text className="text-[11px] text-gray-400 font-semibold">
                SELECTED ITEMS
              </Text>
              <Text className="text-[22px] font-extrabold text-[#1A3F75]">
                {cart.length}
              </Text>
            </View>
            <TouchableOpacity 
              className={`bg-[#1A3F75] px-8 py-4 rounded-2xl shadow-md ${isOrderSubmitting ? 'opacity-70' : ''}`}
              disabled={isOrderSubmitting}
              onPress={handlePlaceOrder}
            >
              {isOrderSubmitting ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-white text-[14px] font-bold">
                  Place Order
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Product Selection Modal */}
      <Modal visible={showProductModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/40 justify-end">
          <View
            className="bg-white rounded-t-3xl"
            style={{
              maxHeight: Dimensions.get("window").height * 0.85,
              paddingBottom: Platform.OS === "ios" ? insets.bottom : 16,
            }}
          >
            {/* Modal Header */}
            <View className="flex-row items-center justify-between px-5 pt-5 pb-3">
              <Text className="text-lg font-bold text-gray-800">
                Select Products
              </Text>
              <TouchableOpacity onPress={() => setShowProductModal(false)}>
                <Ionicons name="close-circle" size={28} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            
            {/* Modal Search */}
            <View className="mx-5 mb-3 flex-row gap-2">
              <View className="flex-1 bg-[#F1F5F9] rounded-xl flex-row items-center px-4 py-2.5">
                <Ionicons name="search" size={18} color="#9CA3AF" />
                <TextInput
                  placeholder="Search by name or brand..."
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 ml-3 text-[13px] text-gray-800"
                  value={modalSearch}
                  onChangeText={setModalSearch}
                />
              </View>
            </View>

            {/* Categories Section */}
            <View className="mb-4">
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={{ paddingHorizontal: 20 }}
              >
                <TouchableOpacity
                  className={`px-4 py-2 rounded-full mr-2 ${selectedCategoryId === null ? 'bg-[#1A3F75]' : 'bg-gray-100'}`}
                  onPress={() => setSelectedCategoryId(null)}
                >
                  <Text className={`text-[12px] font-bold ${selectedCategoryId === null ? 'text-white' : 'text-gray-600'}`}>All</Text>
                </TouchableOpacity>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    className={`px-4 py-2 rounded-full mr-2 ${selectedCategoryId === cat.id ? 'bg-[#1A3F75]' : 'bg-gray-100'}`}
                    onPress={() => setSelectedCategoryId(cat.id)}
                  >
                    <Text className={`text-[12px] font-bold ${selectedCategoryId === cat.id ? 'text-white' : 'text-gray-600'}`}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Product List */}
            {productsLoading ? (
               <ActivityIndicator size="large" color="#1A3F75" style={{ marginTop: 20 }} />
            ) : (
              <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
                {filteredModalProducts.length > 0 ? (
                  filteredModalProducts.map((product) => {
                    const isSelected = cart.some((c) => c.id === product.id);
                    const cartItem = cart.find((c) => c.id === product.id);
                    return (
                      <TouchableOpacity
                        key={product.id}
                        className={`flex-row items-center p-3 mb-2 rounded-xl border ${isSelected ? "bg-[#EEF2FF] border-[#4C73B6]" : "bg-white border-gray-100"}`}
                        onPress={() => toggleProduct(product)}
                      >
                        {/* Checkbox */}
                        <View
                          className={`w-6 h-6 rounded-md border-2 items-center justify-center mr-3 ${isSelected ? "bg-[#4C73B6] border-[#4C73B6]" : "border-gray-300"}`}
                        >
                          {isSelected && (
                            <Ionicons name="checkmark" size={16} color="white" />
                          )}
                        </View>
                        <View className="flex-1">
                          <Text className="text-[14px] font-bold text-gray-800">
                            {product.product_name}
                          </Text>
                          <Text className="text-[12px] text-gray-500 mt-1">
                            {product.brand?.name || "No Brand"}
                          </Text>
                        </View>
                        {isSelected && cartItem && (
                          <View className="flex-row items-center bg-white rounded-xl px-1 border border-[#4C73B6]">
                            <TouchableOpacity
                              className="w-7 h-7 items-center justify-center"
                              onPress={(e) => {
                                e.stopPropagation();
                                updateQty(product.id, -1);
                              }}
                            >
                              <Feather name="minus" size={14} color="#4C73B6" />
                            </TouchableOpacity>
                            <Text className="text-[14px] font-bold text-[#1A3F75] mx-2">
                              {cartItem.qty}
                            </Text>
                            <TouchableOpacity
                              className="w-7 h-7 items-center justify-center"
                              onPress={(e) => {
                                e.stopPropagation();
                                updateQty(product.id, 1);
                              }}
                            >
                              <Feather name="plus" size={14} color="#4C73B6" />
                            </TouchableOpacity>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <View className="items-center py-10">
                    <Text className="text-gray-400">No products found</Text>
                  </View>
                )}
              </ScrollView>
            )}
            {/* Modal Done Button */}
            <View className="px-5 pt-3">
              <TouchableOpacity
                className="bg-[#1A3F75] py-4 rounded-2xl items-center shadow-md"
                onPress={() => setShowProductModal(false)}
              >
                <Text className="text-white text-[14px] font-bold">
                  Done ({cart.length} selected)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <StatusModal 
        visible={modalConfig.visible} 
        onClose={() => setModalConfig({ ...modalConfig, visible: false })}
        type={modalConfig.type} 
        title={modalConfig.title} 
        message={modalConfig.message} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F6F8",
  },
});
