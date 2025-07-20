import { DATABASE_ID, databases, HABITS_COLLECTION_ID } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { ID } from "react-native-appwrite";
import {
  Button,
  SegmentedButtons,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

const FREQUENCIES = ["Daily", "Weekly", "Monthly"];

type Frequency = (typeof FREQUENCIES)[number];

export default function AddHabitScreen() {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [frequency, setFrequency] = useState<Frequency>("daily");
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const router = useRouter();
  const theme = useTheme();

  const handleSubmit = async () => {
    if (!user) return;
    try {
      await databases.createDocument(
        DATABASE_ID,
        HABITS_COLLECTION_ID,
        ID.unique(),
        {
          user_id: user.$id,
          title,
          description,
          frequency,
          streak_count: 0,
          last_completed: new Date().toISOString(),
          created_at: new Date().toISOString(),
        }
      );

      setError(null);

      router.back();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
        return;
      }
      setError("An unexpected error occurred while adding the habit.");
    }
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TextInput
        label="Title"
        mode="outlined"
        onChangeText={setTitle}
        style={styles.input}
      />
      <TextInput
        label="Description"
        mode="outlined"
        onChangeText={setDescription}
        style={styles.input}
      />
      <View style={styles.frequencyContainer}>
        <SegmentedButtons
          value={frequency}
          buttons={FREQUENCIES.map((frequency) => ({
            label: frequency,
            value: frequency.toLowerCase(),
          }))}
          onValueChange={(value) => setFrequency(value as Frequency)}
        />
      </View>
      {error && <Text style={{ color: theme.colors.error, marginBottom: 12 }}>{error}</Text>}
      <Button
        mode="contained"
        disabled={!title || !description}
        onPress={handleSubmit}
      >
        Add Habit
      </Button>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
  },
  input: {
    marginBottom: 16,
  },
  frequencyContainer: {
    marginBottom: 24,
  },
});
