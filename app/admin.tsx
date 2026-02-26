import { useTheme } from '@/context/ThemeContext';
import { db } from '@/lib/firebase';
import { Booking, fetchAllBookings } from '@/services/bookingService';
import { Property, fetchRealEstateData } from '@/services/realEstateService';
import { UserProfile, fetchAllUsers } from '@/services/userService';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminPanel() {
    const router = useRouter();
    const { theme } = useTheme();

    const [loading, setLoading] = useState(true);
    const [listings, setListings] = useState<Property[]>([]);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [activeTab, setActiveTab] = useState<'listings' | 'users' | 'bookings'>('listings');

    // Modal state for Add/Edit
    const [modalVisible, setModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        title: '',
        location: '',
        price: '',
        image_url: '',
        category: 'Luxury',
        beds: '1',
        baths: '1',
        sqft: '1000'
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [listingsData, usersData, bookingsData] = await Promise.all([
            fetchRealEstateData(),
            fetchAllUsers(),
            fetchAllBookings()
        ]);
        setListings(listingsData);
        setUsers(usersData);
        setBookings(bookingsData);
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        Alert.alert('Confirm Delete', 'Are you sure you want to delete this listing?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    setLoading(true);
                    try {
                        await deleteDoc(doc(db, 'listings', id));
                        Alert.alert('Success', 'Listing deleted.');
                        await loadData();
                    } catch (error: any) {
                        Alert.alert('Error', error.message);
                    }
                    setLoading(false);
                }
            }
        ]);
    };

    const openEdit = (item: any) => {
        setFormData({
            id: item.id,
            title: item.title,
            location: item.location,
            price: item.price.replace(/[^0-9]/g, ''), // strip formatting
            image_url: item.image,
            category: item.category,
            beds: String(item.beds),
            baths: String(item.baths),
            sqft: String(item.sqft)
        });
        setIsEditing(true);
        setModalVisible(true);
    };

    const openAdd = () => {
        setFormData({
            id: '',
            title: '',
            location: '',
            price: '',
            image_url: '',
            category: 'Luxury',
            beds: '1',
            baths: '1',
            sqft: '1000'
        });
        setIsEditing(false);
        setModalVisible(true);
    };

    const handleImagePick = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.5,
                base64: true,
            });

            if (!result.canceled && result.assets[0].base64) {
                const base64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
                setFormData({ ...formData, image_url: base64 });
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick image.');
        }
    };

    const handleSave = async () => {
        if (!formData.title || !formData.location || !formData.price || !formData.image_url) {
            Alert.alert('Error', 'Please fill out all required fields.');
            return;
        }

        setLoading(true);
        const payload = {
            title: formData.title,
            location: formData.location,
            price: parseInt(formData.price, 10),
            image_url: formData.image_url,
            category: formData.category,
            beds: parseInt(formData.beds, 10),
            baths: parseInt(formData.baths, 10),
            sqft: parseInt(formData.sqft, 10),
            rating: 4.5,
        };

        try {
            if (isEditing) {
                await updateDoc(doc(db, 'listings', formData.id), payload);
            } else {
                await addDoc(collection(db, 'listings'), payload);
            }
            Alert.alert('Success', `Listing successfully ${isEditing ? 'updated' : 'added'}!`);
            setModalVisible(false);
            await loadData();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
        setLoading(false);
    };

    const renderHeader = () => (
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="chevron-back" size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Admin Panel</Text>
            <TouchableOpacity onPress={loadData} style={styles.backBtn}>
                <Ionicons name="refresh" size={20} color={theme.text} />
            </TouchableOpacity>
        </View>
    );

    const renderTabs = () => (
        <View style={styles.tabContainer}>
            {(['listings', 'users', 'bookings'] as const).map(tab => (
                <TouchableOpacity
                    key={tab}
                    onPress={() => setActiveTab(tab)}
                    style={[styles.tabBtn, activeTab === tab && { borderBottomColor: theme.text }]}
                >
                    <Text style={[styles.tabText, { color: activeTab === tab ? theme.text : theme.subText, fontWeight: activeTab === tab ? 'bold' : 'normal' }]}>
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
            {renderHeader()}
            {renderTabs()}

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.text} />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.content}>
                    {activeTab === 'listings' && (
                        <>
                            <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.text }]} onPress={openAdd}>
                                <Ionicons name="add" size={20} color={theme.bg} />
                                <Text style={[styles.addText, { color: theme.bg }]}>Add New Listing</Text>
                            </TouchableOpacity>

                            {listings.map(item => (
                                <View key={item.id} style={[styles.listItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                    <View style={styles.listText}>
                                        <Text style={[styles.listTitle, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
                                        <Text style={[styles.listSub, { color: theme.subText }]}>{item.location} • {item.price}</Text>
                                    </View>
                                    <View style={styles.listActions}>
                                        <TouchableOpacity style={styles.actionBtn} onPress={() => openEdit(item)}>
                                            <Ionicons name="pencil-outline" size={20} color="#4A90E2" />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item.id)}>
                                            <Ionicons name="trash-outline" size={20} color="#E24A4A" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </>
                    )}

                    {activeTab === 'users' && (
                        <View>
                            {users.length === 0 ? (
                                <Text style={{ color: theme.subText, textAlign: 'center', marginTop: 20 }}>No users found.</Text>
                            ) : (
                                users.map((u, i) => (
                                    <View key={u.id || i} style={[styles.mockCard, { borderColor: theme.border, backgroundColor: theme.card }]}>
                                        <View style={styles.mockRow}><Ionicons name="person" size={16} color={theme.text} /><Text style={[styles.mockText, { color: theme.text }]}>{u.firstName} {u.lastName}</Text></View>
                                        <View style={styles.mockRow}><Ionicons name="mail" size={16} color={theme.subText} /><Text style={[styles.mockText, { color: theme.subText }]}>{u.email}</Text></View>
                                        <Text style={[styles.mockSub, { color: theme.subText, alignSelf: 'flex-end' }]}>Joined: {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Unknown'}</Text>
                                    </View>
                                ))
                            )}
                        </View>
                    )}

                    {activeTab === 'bookings' && (
                        <View>
                            {bookings.length === 0 ? (
                                <Text style={{ color: theme.subText, textAlign: 'center', marginTop: 20 }}>No bookings found.</Text>
                            ) : (
                                bookings.map((b, i) => (
                                    <View key={b.id || i} style={[styles.mockCard, { borderColor: theme.border, backgroundColor: theme.card }]}>
                                        <View style={styles.mockRow}><Ionicons name="home" size={16} color={theme.text} /><Text style={[styles.mockText, { color: theme.text }]}>{b.listing_title}</Text></View>
                                        <View style={styles.mockRow}><Ionicons name="person" size={16} color={theme.subText} /><Text style={[styles.mockText, { color: theme.subText }]}>{b.guest_email || b.clerk_user_id}</Text></View>
                                        <Text style={[styles.mockSub, { color: theme.text, alignSelf: 'flex-end', fontWeight: 'bold' }]}>{new Date(b.check_in_date).toLocaleDateString()} - {new Date(b.check_out_date).toLocaleDateString()}</Text>
                                    </View>
                                ))
                            )}
                        </View>
                    )}
                </ScrollView>
            )}

            {/* Form Modal */}
            <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
                <View style={[styles.modalContainer, { backgroundColor: theme.bg }]}>
                    <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
                        <TouchableOpacity onPress={() => setModalVisible(false)}><Text style={{ color: theme.text, fontSize: 16 }}>Cancel</Text></TouchableOpacity>
                        <Text style={{ color: theme.text, fontSize: 18, fontWeight: 'bold' }}>{isEditing ? 'Edit Listing' : 'Add Listing'}</Text>
                        <TouchableOpacity onPress={handleSave}><Text style={{ color: '#4A90E2', fontSize: 16, fontWeight: 'bold' }}>Save</Text></TouchableOpacity>
                    </View>
                    <ScrollView contentContainerStyle={styles.formContent}>
                        <Text style={[styles.label, { color: theme.text }]}>Title</Text>
                        <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} placeholder="e.g. Luxury Villa" placeholderTextColor={theme.subText} value={formData.title} onChangeText={t => setFormData({ ...formData, title: t })} />

                        <Text style={[styles.label, { color: theme.text }]}>Location</Text>
                        <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} placeholder="e.g. Bali, Indonesia" placeholderTextColor={theme.subText} value={formData.location} onChangeText={t => setFormData({ ...formData, location: t })} />

                        <Text style={[styles.label, { color: theme.text }]}>Price per Night (INR)</Text>
                        <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} placeholder="e.g. 5000" placeholderTextColor={theme.subText} value={formData.price} onChangeText={t => setFormData({ ...formData, price: t })} keyboardType="numeric" />

                        <Text style={[styles.label, { color: theme.text }]}>Image URL / Upload Image</Text>
                        {formData.image_url ? (
                            <View style={styles.imagePreviewContainer}>
                                <Image source={{ uri: formData.image_url }} style={styles.imagePreview} />
                                <View style={styles.imageActions}>
                                    <TouchableOpacity style={[styles.imageBtn, { backgroundColor: '#4A90E2' }]} onPress={handleImagePick}>
                                        <Text style={{ color: '#FFF' }}>Change Photo</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.imageBtn, { backgroundColor: '#f0f0f0' }]} onPress={() => setFormData({ ...formData, image_url: '' })}>
                                        <Text style={{ color: '#000' }}>Remove</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <TouchableOpacity style={[styles.uploadBox, { borderColor: theme.border, backgroundColor: theme.inputBg }]} onPress={handleImagePick}>
                                <Ionicons name="image-outline" size={32} color={theme.subText} />
                                <Text style={{ color: theme.subText, marginTop: 8 }}>Tap to pick an image from gallery</Text>
                            </TouchableOpacity>
                        )}
                        <Text style={{ color: theme.subText, fontSize: 12, marginTop: 4, marginBottom: 12 }}>Alternatively, paste a URL below:</Text>
                        <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} placeholder="https://..." placeholderTextColor={theme.subText} value={formData.image_url} onChangeText={t => setFormData({ ...formData, image_url: t })} autoCapitalize="none" />

                        <View style={styles.row}>
                            <View style={styles.flex1}>
                                <Text style={[styles.label, { color: theme.text }]}>Beds</Text>
                                <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} value={formData.beds} onChangeText={t => setFormData({ ...formData, beds: t })} keyboardType="numeric" />
                            </View>
                            <View style={{ width: 16 }} />
                            <View style={styles.flex1}>
                                <Text style={[styles.label, { color: theme.text }]}>Baths</Text>
                                <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} value={formData.baths} onChangeText={t => setFormData({ ...formData, baths: t })} keyboardType="numeric" />
                            </View>
                        </View>

                        <Text style={[styles.label, { color: theme.text }]}>Category</Text>
                        <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} placeholder="Luxury, Mountain, Beach" placeholderTextColor={theme.subText} value={formData.category} onChangeText={t => setFormData({ ...formData, category: t })} />

                        <Text style={[styles.label, { color: theme.text }]}>Sqft Area</Text>
                        <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} value={formData.sqft} onChangeText={t => setFormData({ ...formData, sqft: t })} keyboardType="numeric" />
                    </ScrollView>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1 },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
    backBtn: { padding: 4 },
    tabContainer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 },
    tabBtn: { paddingVertical: 8, paddingHorizontal: 16, borderBottomWidth: 2, borderBottomColor: 'transparent' },
    tabText: { fontSize: 16 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { padding: 20, paddingBottom: 60 },
    addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, marginBottom: 20 },
    addText: { fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
    listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderWidth: 1, borderRadius: 12, marginBottom: 12 },
    listText: { flex: 1, marginRight: 10 },
    listTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
    listSub: { fontSize: 14 },
    listActions: { flexDirection: 'row', gap: 16 },
    actionBtn: { padding: 8, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 8 },
    modalContainer: { flex: 1, paddingTop: Platform.OS === 'android' ? 20 : 0 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1 },
    formContent: { padding: 20, paddingBottom: 100 },
    label: { fontSize: 14, fontWeight: '500', marginBottom: 8, marginTop: 16 },
    input: { borderWidth: 1, borderRadius: 10, padding: 16, fontSize: 16 },
    row: { flexDirection: 'row' },
    flex1: { flex: 1 },
    mockCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
    mockRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
    mockText: { fontSize: 15 },
    mockSub: { fontSize: 12, marginTop: 4 },
    imagePreviewContainer: { marginBottom: 16 },
    imagePreview: { width: '100%', height: 200, borderRadius: 12, backgroundColor: '#eee', marginBottom: 10 },
    imageActions: { flexDirection: 'row', gap: 10 },
    imageBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    uploadBox: { borderWidth: 1, borderStyle: 'dashed', borderRadius: 12, padding: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }
});
