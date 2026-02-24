import { useTheme } from '@/context/ThemeContext';
import { useWarmUpBrowser } from '@/lib/useWarmUpBrowser';
import { useAuth, useOAuth, useSignIn, useSignUp } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
    useWarmUpBrowser();

    const { isSignedIn } = useAuth();
    if (isSignedIn) return <Redirect href="/(tabs)" />;

    const { signIn, setActive: setSignInActive, isLoaded: isSignInLoaded } = useSignIn();
    const { signUp, setActive: setSignUpActive, isLoaded: isSignUpLoaded } = useSignUp();
    const router = useRouter();
    const params = useLocalSearchParams();
    const { theme } = useTheme();

    // OAuth Hooks
    const { startOAuthFlow: startGoogleOAuthFlow } = useOAuth({ strategy: "oauth_google" });
    const { startOAuthFlow: startAppleOAuthFlow } = useOAuth({ strategy: "oauth_apple" });

    // Mode Toggle
    const [isSignUp, setIsSignUp] = useState(false);

    // Form State
    const [emailAddress, setEmailAddress] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    // Verification State
    const [pendingVerification, setPendingVerification] = useState(false);
    const [code, setCode] = useState('');

    // UI State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (params.initialMode === 'signup') {
            setIsSignUp(true);
        }
    }, [params.initialMode]);

    // Format Clerk Errors
    const handleError = (err: any) => {
        console.error(JSON.stringify(err, null, 2));
        const errorMessage = err.errors ? err.errors[0].message : 'Something went wrong';
        const errorCode = err.errors ? err.errors[0].code : '';

        if (errorCode === 'form_password_pwned') {
            setError('This password has been found in a data breach. Please choose a different, stronger password.');
        } else if (errorCode === 'form_identifier_not_found') {
            setError("Couldn't find your account. Please sign up.");
        } else if (errorCode === 'form_password_incorrect') {
            setError('Incorrect password. Please try again.');
        } else {
            setError(errorMessage);
        }
    };

    // OAuth Handler
    const onSelectAuth = async (strategy: 'oauth_google' | 'oauth_apple') => {
        if (!isSignInLoaded || !isSignUpLoaded) return;
        setLoading(true);
        setError('');

        try {
            const startFlow = strategy === 'oauth_google' ? startGoogleOAuthFlow : startAppleOAuthFlow;

            const { createdSessionId, setActive, signUp, signIn } = await startFlow();

            if (createdSessionId) {
                setActive!({ session: createdSessionId });
                router.replace('/(tabs)');
            } else {
                // Check if further steps are needed (like MFA)
                // For this simple example, we assume successful creation or sign-in leads to session
                // Use signIn or signUp for next steps such as MFA
                handleError({ errors: [{ message: 'OAuth flow completed without session creation. Check Clerk dashboard settings.' }] });
            }
        } catch (err: any) {
            console.error("OAuth error", err);
            // Provide user feedback, maybe it was cancelled
            if (JSON.stringify(err).includes("cancelled")) {
                // user cancelled, do nothing
            } else {
                handleError(err);
            }
        } finally {
            setLoading(false);
        }
    }


    // 1. Handle Sign In (Email/Pass)
    const onSignInPress = async () => {
        if (!isSignInLoaded) return;
        setLoading(true);
        setError('');

        try {
            const completeSignIn = await signIn.create({
                identifier: emailAddress,
                password,
            });
            await setSignInActive({ session: completeSignIn.createdSessionId });
            router.replace('/(tabs)');
        } catch (err: any) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    };

    // 2. Handle Sign Up (Email/Pass)
    const onSignUpPress = async () => {
        if (!isSignUpLoaded) return;
        setLoading(true);
        setError('');

        try {
            await signUp.create({
                emailAddress,
                password,
                firstName,
                lastName
            });

            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
            setPendingVerification(true);
            setError('');
        } catch (err: any) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    };

    // 3. Handle Verify Email Code
    const onPressVerify = async () => {
        if (!isSignUpLoaded) return;
        setLoading(true);
        setError('');

        try {
            const completeSignUp = await signUp.attemptEmailAddressVerification({
                code,
            });

            await setSignUpActive({ session: completeSignUp.createdSessionId });
            router.replace('/(tabs)');
        } catch (err: any) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    };

    // Render Input Helper 
    const renderInput = (
        placeholder: string,
        value: string,
        setValue: (t: string) => void,
        secure = false,
        keyboardType: any = 'default'
    ) => (
        <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
            <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder={placeholder}
                placeholderTextColor={theme.subText}
                value={value}
                onChangeText={(t) => {
                    setValue(t);
                    setError('');
                }}
                secureTextEntry={secure}
                autoCapitalize="none"
                keyboardType={keyboardType}
            />
        </View>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: theme.bg }]}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: theme.card }]}>
                    <Ionicons name="close" size={24} color={theme.text} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={styles.titleContainer}>
                    <Text style={[styles.title, { color: theme.text }]}>
                        {pendingVerification ? 'Verify Email' : (isSignUp ? 'Create Account' : 'Welcome Back')}
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.subText }]}>
                        {pendingVerification
                            ? `We've sent a code to ${emailAddress}`
                            : (isSignUp ? 'Join Homzy to start your journey.' : 'Login to access your saved homes.')}
                    </Text>
                </View>

                {error ? (
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle" size={20} color="#FF385C" />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : null}

                {/* Verification Code Input */}
                {pendingVerification ? (
                    <View style={styles.form}>
                        {renderInput("Enter 6-digit code", code, setCode, false, 'number-pad')}

                        <TouchableOpacity
                            onPress={onPressVerify}
                            style={[styles.primaryButton, { backgroundColor: theme.text, opacity: loading ? 0.7 : 1 }]}
                            disabled={loading}
                        >
                            {loading ? <ActivityIndicator color={theme.bg} /> : <Text style={[styles.primaryButtonText, { color: theme.bg }]}>Verify Email</Text>}
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setPendingVerification(false)} style={styles.textButton}>
                            <Text style={[styles.textButtonLabel, { color: theme.subText }]}>Change Email</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    // Login / Signup Form
                    <View style={styles.form}>
                        {isSignUp && (
                            <View style={styles.row}>
                                <View style={[styles.flex1, { marginRight: 8 }]}>
                                    {renderInput("First Name", firstName, setFirstName)}
                                </View>
                                <View style={[styles.flex1, { marginLeft: 8 }]}>
                                    {renderInput("Last Name", lastName, setLastName)}
                                </View>
                            </View>
                        )}

                        {renderInput("Email Address", emailAddress, setEmailAddress, false, 'email-address')}
                        {renderInput("Password", password, setPassword, true)}

                        <TouchableOpacity
                            onPress={isSignUp ? onSignUpPress : onSignInPress}
                            style={[styles.primaryButton, { backgroundColor: theme.text, opacity: loading ? 0.7 : 1 }]}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={theme.bg} />
                            ) : (
                                <Text style={[styles.primaryButtonText, { color: theme.bg }]}>
                                    {isSignUp ? 'Sign Up' : 'Log In'}
                                </Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.divider}>
                            <View style={[styles.line, { backgroundColor: theme.border }]} />
                            <Text style={[styles.dividerText, { color: theme.subText }]}>or</Text>
                            <View style={[styles.line, { backgroundColor: theme.border }]} />
                        </View>

                        <View style={styles.socialRow}>
                            <TouchableOpacity
                                onPress={() => onSelectAuth('oauth_google')}
                                style={[styles.socialBtn, { borderColor: theme.border, backgroundColor: theme.card }]}
                            >
                                <Ionicons name="logo-google" size={24} color={theme.text} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => onSelectAuth('oauth_apple')}
                                style={[styles.socialBtn, { borderColor: theme.border, backgroundColor: theme.card }]}
                            >
                                <Ionicons name="logo-apple" size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.toggleContainer}>
                            <Text style={[styles.toggleText, { color: theme.subText }]}>
                                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                            </Text>
                            <TouchableOpacity onPress={() => {
                                setIsSignUp(!isSignUp);
                                setError('');
                            }}>
                                <Text style={[styles.toggleLink, { color: theme.text }]}>
                                    {isSignUp ? 'Log in' : 'Sign up'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 40,
    },
    titleContainer: {
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        lineHeight: 24,
    },
    form: {
        gap: 16,
    },
    row: {
        flexDirection: 'row',
    },
    flex1: {
        flex: 1,
    },
    inputContainer: {
        height: 56,
        borderRadius: 16,
        borderWidth: 1,
        paddingHorizontal: 16,
        marginBottom: 16,
        justifyContent: 'center',
    },
    input: {
        fontSize: 16,
        height: '100%',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 56, 92, 0.1)',
        padding: 12,
        borderRadius: 12,
        marginBottom: 20,
        gap: 10,
    },
    errorText: {
        color: '#FF385C',
        fontSize: 14,
        flex: 1,
    },
    primaryButton: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 32,
    },
    line: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        marginHorizontal: 16,
        fontSize: 14,
    },
    socialRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        marginBottom: 32,
    },
    socialBtn: {
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    toggleContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    toggleText: {
        fontSize: 14,
    },
    toggleLink: {
        fontSize: 14,
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
    textButton: {
        alignItems: 'center',
        marginTop: 16,
    },
    textButtonLabel: {
        fontSize: 14,
        fontWeight: 'bold',
    },
});
