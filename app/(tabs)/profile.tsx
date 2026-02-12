
import { useTheme } from '@/context/ThemeContext';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Image, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { height } = Dimensions.get('window');

export default function ProfileScreen() {
    const router = useRouter();
    const { theme, isDarkMode, toggleTheme } = useTheme();
    const { user, isSignedIn } = useUser();
    const { signOut } = useAuth();

    // User State
    const [userData, setUserData] = useState({
        name: 'Guest User',
        email: 'Sign in to access your profile',
        phone: '',
        bio: 'Love traveling and exploring new places.',
        image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=800'
    });

    useEffect(() => {
        if (isSignedIn && user) {
            setUserData({
                name: user.fullName || user.firstName || 'User',
                email: user.primaryEmailAddress?.emailAddress || '',
                phone: user.primaryPhoneNumber?.phoneNumber || '',
                bio: 'Love traveling and exploring new places.',
                image: user.imageUrl || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=800'
            });
        } else {
            setUserData({
                name: 'Guest User',
                email: 'Sign in to access your profile',
                phone: '',
                bio: 'Love traveling and exploring new places.',
                image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=800'
            });
        }
    }, [isSignedIn, user]);

    // UI State
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const handleImageUpload = async () => {
        if (!isSignedIn || !user) return;

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
                base64: true,
            });

            if (!result.canceled && result.assets[0].base64) {
                const base64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
                await user.setProfileImage({ file: base64 });

                // Optimistically update local state
                setUserData({ ...userData, image: base64 });
                Alert.alert('Success', 'Profile photo updated!');
            }
        } catch (error: any) {
            console.error('Upload failed:', error);
            Alert.alert('Error', 'Failed to upload image. Please try again.');
        }
    };

    const handleSaveProfile = () => {
        // Implement profile update logic here if needed with Clerk
        setEditModalVisible(false);
        Alert.alert('Profile Updated', 'Your personal information has been saved.');
    };

    const ProfileOption = ({ icon, label, subLabel, isSwitch, switchValue, onToggle, onPress }: any) => (
        <TouchableOpacity
            style={[styles.optionRow, { borderBottomColor: theme.border }]}
            activeOpacity={isSwitch ? 1 : 0.7}
            onPress={isSwitch ? undefined : onPress}
        >
            <View style={styles.optionIconContainer}>
                <Ionicons name={icon} size={22} color={theme.icon} />
            </View>
            <View style={styles.optionContent}>
                <View>
                    <Text style={[styles.optionLabel, { color: theme.text }]}>{label}</Text>
                    {subLabel && <Text style={[styles.optionSubLabel, { color: theme.subText }]}>{subLabel}</Text>}
                </View>

                {isSwitch ? (
                    <Switch
                        value={switchValue}
                        onValueChange={onToggle}
                        trackColor={{ false: "#CCC", true: isDarkMode ? "#FFF" : "#000" }}
                        thumbColor={switchValue ? (isDarkMode ? "#000" : "#FFF") : "#f4f3f4"}
                    />
                ) : (
                    <Ionicons name="chevron-forward" size={20} color={theme.subText} />
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
                <TouchableOpacity onPress={() => Alert.alert('Notifications', 'No new notifications')}>
                    <Ionicons name="notifications-outline" size={24} color={theme.icon} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* User Card */}
                <View style={[styles.userCard, { borderBottomColor: theme.border }]}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: userData.image }}
                            style={[styles.avatar, { backgroundColor: theme.card }]}
                        />
                        {isSignedIn && (
                            <TouchableOpacity style={[styles.editAvatarBtn, { backgroundColor: theme.card }]} onPress={handleImageUpload}>
                                <Ionicons name="camera" size={14} color={theme.icon} />
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={[styles.userName, { color: theme.text }]}>{userData.name}</Text>
                        <Text style={[styles.userEmail, { color: theme.subText }]}>{userData.email}</Text>
                    </View>
                    {isSignedIn && (
                        <TouchableOpacity style={styles.chevronBtn} onPress={() => { setEditModalVisible(true); }}>
                            <Ionicons name="chevron-forward" size={24} color={theme.icon} />
                        </TouchableOpacity>
                    )}
                </View>

                {!isSignedIn && (
                    <TouchableOpacity
                        style={[styles.logoutButton, { borderColor: theme.border, backgroundColor: theme.text, marginBottom: 24 }]}
                        onPress={() => router.push('/login')}
                    >
                        <Text style={[styles.logoutText, { color: theme.bg }]}>Log In / Sign Up</Text>
                    </TouchableOpacity>
                )}

                {/* Airbnb-style Settings */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Account Settings</Text>

                <View style={[styles.sectionContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <ProfileOption
                        icon="person-outline"
                        label="Personal Information"
                        subLabel="Edit your details"
                        onPress={() => { if (isSignedIn) setEditModalVisible(true); else router.push('/login'); }}
                    />
                    <ProfileOption
                        icon="shield-checkmark-outline"
                        label="Login & Security"
                        onPress={() => Alert.alert('Security', 'Password updated 3 days ago.')}
                    />
                    <ProfileOption
                        icon="card-outline"
                        label="Payments and Payouts"
                        onPress={() => Alert.alert('Payments', 'No cards saved.')}
                    />
                </View>

                <Text style={[styles.sectionTitle, { color: theme.text }]}>App Preferences</Text>
                <View style={[styles.sectionContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <ProfileOption
                        icon="moon-outline"
                        label="Dark Mode"
                        isSwitch
                        switchValue={isDarkMode}
                        onToggle={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                            toggleTheme();
                        }}
                    />
                    <ProfileOption
                        icon="notifications-outline"
                        label="Notifications"
                        isSwitch
                        switchValue={notificationsEnabled}
                        onToggle={setNotificationsEnabled}
                    />
                </View>

                <Text style={[styles.sectionTitle, { color: theme.text }]}>Support</Text>
                <View style={[styles.sectionContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <ProfileOption
                        icon="help-circle-outline"
                        label="Get Help"
                        onPress={() => Alert.alert('Support', 'Connecting you to support...')}
                    />
                    <ProfileOption
                        icon="chatbox-ellipses-outline"
                        label="Give Feedback"
                        onPress={() => Alert.alert('Feedback', 'Thank you for your feedback!')}
                    />
                </View>

                {/* Sign Out Button */}
                {isSignedIn && (
                    <TouchableOpacity
                        style={[styles.logoutButton, { borderColor: theme.border }]}
                        onPress={() => {
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                            signOut();
                        }}
                    >
                        <Text style={[styles.logoutText, { color: theme.text }]}>Log Out</Text>
                    </TouchableOpacity>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Edit Profile Modal */}
            <Modal visible={isEditModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setEditModalVisible(false)}>
                <View style={[styles.modalContainer, { backgroundColor: theme.modalBg }]}>
                    <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
                        <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                            <Text style={[styles.modalCancel, { color: theme.text }]}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Personal Info</Text>
                        <TouchableOpacity onPress={handleSaveProfile}>
                            <Text style={[styles.modalSave, { color: theme.text }]}>Save</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        <Text style={styles.inputLabel}>Full Name</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
                            value={userData.name}
                            onChangeText={t => setUserData({ ...userData, name: t })}
                            editable={false} // Clerk managed for now
                        />
                        <Text style={styles.inputHelper}>Managed by your Clerk account.</Text>

                        <Text style={styles.inputLabel}>Email Address</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
                            value={userData.email}
                            editable={false}
                        />

                        <Text style={styles.inputLabel}>Phone Number</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
                            value={userData.phone}
                            onChangeText={t => setUserData({ ...userData, phone: t })}
                            keyboardType="phone-pad"
                        />

                        <Text style={styles.inputLabel}>About</Text>
                        <TextInput
                            style={[styles.input, { height: 100, textAlignVertical: 'top', backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
                            value={userData.bio}
                            onChangeText={t => setUserData({ ...userData, bio: t })}
                            multiline
                        />
                    </ScrollView>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 30,
        fontWeight: 'bold',
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
        borderBottomWidth: 1,
        marginBottom: 24,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
    },
    editAvatarBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    userInfo: {
        flex: 1,
        marginLeft: 16,
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
    },
    chevronBtn: {
        padding: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        marginTop: 8,
    },
    sectionContainer: {
        marginBottom: 24,
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
    },
    optionIconContainer: {
        marginRight: 16,
    },
    optionContent: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    optionLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    optionSubLabel: {
        fontSize: 12,
        marginTop: 2,
    },
    logoutButton: {
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 20,
    },
    logoutText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
    },
    modalCancel: {
        fontSize: 16,
    },
    modalSave: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalContent: {
        padding: 24,
    },
    inputLabel: {
        color: '#888',
        fontSize: 12,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    input: {
        padding: 16,
        borderRadius: 8,
        fontSize: 16,
        marginBottom: 8,
        borderWidth: 1,
    },
    inputHelper: {
        color: '#666',
        fontSize: 12,
        marginBottom: 24,
    },
});
