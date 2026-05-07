import React, { useState } from "react";
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
} from "react-native";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const allStores = [
  {
    id: 1,
    name: "Krishna Medical Stores",
    category: "Medicine Shop",
    contact: "+91 9876543210",
    email: "krishna@med.com",
    address: "12, MG Road, Ahmedabad",
    image:
      "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Radha Rakomari Store",
    category: "Grocery Shop",
    contact: "+91 9123456780",
    email: "radha@store.com",
    address: "45, Station Rd, Surat",
    image:
      "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Narmada Medical",
    category: "Medicine Shop",
    contact: "+91 8765432109",
    email: "narmada@med.com",
    address: "78, Ring Road, Vadodara",
    image:
      "https://images.unsplash.com/photo-1576602976047-174e57a47881?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Sri Hari Medicine Center",
    category: "Pharmacy",
    contact: "+91 7654321098",
    email: "srihari@pharma.com",
    address: "23, CG Road, Rajkot",
    image:
      "https://images.unsplash.com/photo-1585435557343-3b092031a831?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 5,
    name: "MedPlus Pharmacy",
    category: "Pharmacy",
    contact: "+91 6543210987",
    email: "medplus@rx.com",
    address: "90, SG Highway, Ahmedabad",
    image:
      "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 6,
    name: "Apollo Medical Shop",
    category: "Medicine Shop",
    contact: "+91 5432109876",
    email: "apollo@med.com",
    address: "56, Law Garden, Ahmedabad",
    image:
      "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=200&auto=format&fit=crop",
  },
];

const productCatalog = [
  {
    id: 1,
    name: "Paracetamol 500mg",
    composition: "Acetaminophen 500mg",
    brand: "Cipla",
    price: 35,
    unit: "Strip (10)",
    image:
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=100&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Amoxicillin 250mg",
    composition: "Amoxicillin Trihydrate 250mg",
    brand: "Sun Pharma",
    price: 85,
    unit: "Strip (10)",
    image:
      "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=100&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Cetirizine 10mg",
    composition: "Cetirizine Dihydrochloride 10mg",
    brand: "Dr. Reddy",
    price: 28,
    unit: "Strip (10)",
    image:
      "https://images.unsplash.com/photo-1550572017-edd951aa8f72?q=80&w=100&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Omeprazole 20mg",
    composition: "Omeprazole 20mg",
    brand: "Mankind",
    price: 62,
    unit: "Strip (15)",
    image:
      "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?q=80&w=100&auto=format&fit=crop",
  },
  {
    id: 5,
    name: "Azithromycin 500mg",
    composition: "Azithromycin Dihydrate 500mg",
    brand: "Cipla",
    price: 120,
    unit: "Strip (3)",
    image:
      "https://images.unsplash.com/photo-1576602976047-174e57a47881?q=80&w=100&auto=format&fit=crop",
  },
  {
    id: 6,
    name: "Metformin 500mg",
    composition: "Metformin HCl 500mg",
    brand: "USV",
    price: 45,
    unit: "Strip (10)",
    image:
      "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?q=80&w=100&auto=format&fit=crop",
  },
];

interface CartItem {
  id: number;
  name: string;
  composition: string;
  brand: string;
  price: number;
  unit: string;
  image: string;
  qty: number;
}

export default function OrderCreateScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();

  const fromStore = params.fromStore === "true";
  const preSelectedStore = fromStore ? (params.storeName as string) : "";
  const storeCategory = (params.storeCategory as string) || "";
  const storeContact = (params.storeContact as string) || "";
  const storeImage = (params.storeImage as string) || "";

  const [selectedStore, setSelectedStore] = useState(preSelectedStore);
  const [showStoreDropdown, setShowStoreDropdown] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [modalSearch, setModalSearch] = useState("");
  const [note, setNote] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);

  const selectedStoreData = allStores.find((s) => s.name === selectedStore);

  const filteredModalProducts = productCatalog.filter(
    (p) =>
      p.name.toLowerCase().includes(modalSearch.toLowerCase()) ||
      p.composition.toLowerCase().includes(modalSearch.toLowerCase()),
  );

  const toggleProduct = (product: (typeof productCatalog)[0]) => {
    const existing = cart.find((c) => c.id === product.id);
    if (existing) {
      setCart(cart.filter((c) => c.id !== product.id));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const updateQty = (id: number, delta: number) => {
    setCart(
      cart.map((c) =>
        c.id === id ? { ...c, qty: Math.max(1, c.qty + delta) } : c,
      ),
    );
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  );
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  const renderStoreProfileCard = () => {
    const name = fromStore ? preSelectedStore : selectedStore;
    const cat = fromStore ? storeCategory : selectedStoreData?.category || "";
    const phone = fromStore ? storeContact : selectedStoreData?.contact || "";
    const email = fromStore
      ? "store@pharmacy.com"
      : selectedStoreData?.email || "";
    const addr = fromStore
      ? "123, Main Road, City Center"
      : selectedStoreData?.address || "";
    const img = fromStore ? storeImage : selectedStoreData?.image || "";

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
              <MaterialIcons name="email" size={15} color="#9CA3AF" />
              <Text className="text-[12px] text-gray-500 ml-2">{email}</Text>
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
          <Text className="text-[12px] text-gray-500 ml-2 flex-1">{addr}</Text>
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
        {/* Store Selector (from Orders tab) */}
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
                  className={`ml-3 text-[14px] font-semibold ${selectedStore ? "text-gray-800" : "text-gray-400"}`}
                >
                  {selectedStore || "Choose a store..."}
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
                {allStores.map((store) => (
                  <TouchableOpacity
                    key={store.id}
                    className={`flex-row items-center px-4 py-3 border-b border-gray-50 ${selectedStore === store.name ? "bg-[#EEF2FF]" : ""}`}
                    onPress={() => {
                      setSelectedStore(store.name);
                      setShowStoreDropdown(false);
                    }}
                  >
                    <Image
                      source={{ uri: store.image }}
                      className="w-9 h-9 rounded-full bg-gray-200"
                      resizeMode="cover"
                    />
                    <View className="ml-3 flex-1">
                      <Text className="text-[13px] font-semibold text-gray-800">
                        {store.name}
                      </Text>
                      <Text className="text-[11px] text-gray-400">
                        {store.category}
                      </Text>
                    </View>
                    {selectedStore === store.name && (
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
        {(selectedStore || fromStore) && (
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
              <TouchableOpacity className="flex-row items-center mt-1">
                <Ionicons name="calendar-outline" size={18} color="#4C73B6" />
                <Text className="text-[13px] text-gray-700 font-semibold ml-2">
                  {deliveryDate || "Select Date"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Select Product Button */}
        {(selectedStore || fromStore) && (
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
                    className="text-[13px] font-bold text-gray-800"
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <Text className="text-[11px] text-gray-400 mt-0.5">
                    {item.brand} · {item.unit}
                  </Text>
                  <Text className="text-[13px] font-bold text-[#4C73B6] mt-0.5">
                    ₹{item.price} × {item.qty} = ₹{item.price * item.qty}
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
      {cart.length > 0 && (selectedStore || fromStore) && (
        <View
          className="absolute bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-100"
          style={{ paddingBottom: Platform.OS === "ios" ? insets.bottom : 16 }}
        >
          <View className="flex-row items-center justify-between px-5 pt-4 pb-2">
            <View>
              <Text className="text-[11px] text-gray-400 font-semibold">
                TOTAL AMOUNT
              </Text>
              <Text className="text-[22px] font-extrabold text-[#1A3F75]">
                ₹{totalAmount}
              </Text>
              <Text className="text-[11px] text-gray-400">
                {totalItems} items
              </Text>
            </View>
            <TouchableOpacity className="bg-[#1A3F75] px-8 py-4 rounded-2xl shadow-md">
              <Text className="text-white text-[14px] font-bold">
                Place Order
              </Text>
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
              maxHeight: Dimensions.get("window").height * 0.8,
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
            <View className="mx-5 mb-3 bg-[#F1F5F9] rounded-xl flex-row items-center px-4 py-2.5">
              <Ionicons name="search" size={18} color="#9CA3AF" />
              <TextInput
                placeholder="Search by name or composition..."
                placeholderTextColor="#9CA3AF"
                className="flex-1 ml-3 text-[13px] text-gray-800"
                value={modalSearch}
                onChangeText={setModalSearch}
              />
            </View>
            {/* Product List */}
            <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
              {filteredModalProducts.map((product) => {
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
                      <Text className="text-[13px] font-bold text-gray-800">
                        {product.name}
                      </Text>
                      <Text className="text-[11px] text-gray-400 mt-0.5">
                        {product.composition}
                      </Text>
                      <Text className="text-[13px] font-bold text-[#4C73B6] mt-1">
                        ₹{product.price} / {product.unit}
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
              })}
            </ScrollView>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F6F8",
  },
});
