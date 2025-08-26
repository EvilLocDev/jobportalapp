import React, { useState, useEffect } from 'react';
import { TouchableOpacity, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import MyStyles from '../../styles/MyStyles';

// Props initialValues: Initial values to populate the form (for editing existing job)
const JobForm = ({ initialValues, onSubmit, submitButtonText = "Submit", loading = false }) => {
    const [jobData, setJobData] = useState({
        title: '',
        description: '',
        location: '',
        salary: '',
        job_type: 'full_time',
        expiration_date: ''
    });

    const [date, setDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);

    useEffect(() => {
        if (initialValues) {
            setJobData({
                title: initialValues.title || '',
                description: initialValues.description || '',
                location: initialValues.location || '',
                salary: initialValues.salary?.toString() || '',
                job_type: initialValues.job_type || 'full_time',
                expiration_date: initialValues.expiration_date || ''
            });
        }
    }, [initialValues]);

    const updateState = (field, value) => {
        setJobData(current => ({ ...current, [field]: value }));
    };

    const onDateChange = (event, selectedDate) => {
        setShowPicker(false);
        if (selectedDate) {
            setDate(selectedDate);
            const formattedDate = selectedDate.toISOString().split('T')[0];
            updateState('expiration_date', formattedDate);
        }
    };

    const handleFormSubmit = () => {
        if (!jobData.title || !jobData.location || !jobData.salary) {
            Alert.alert("Error", "Please fill the fields have symbol (*).");
            return;
        }
        onSubmit(jobData);
    };

    return (
        <ScrollView style={MyStyles.container}>
            <TextInput label="Job title (*)" value={jobData.title} onChangeText={t => updateState('title', t)} style={MyStyles.m} />
            <TextInput label="Job description" value={jobData.description} onChangeText={t => updateState('description', t)} style={MyStyles.m} multiline />
            <TextInput label="Location (*)" value={jobData.location} onChangeText={t => updateState('location', t)} style={MyStyles.m} />
            <TextInput label="Salary (*)" value={jobData.salary} onChangeText={t => updateState('salary', t)} style={MyStyles.m} keyboardType="numeric" />
            <Text style={MyStyles.m}>Expired day (Optional)</Text>
            <TouchableOpacity onPress={() => setShowPicker(true)}>
                <TextInput
                    style={MyStyles.m}
                    label="YYYY-MM-DD"
                    value={jobData.expiration_date}
                    editable={false}
                    right={<TextInput.Icon icon="calendar" />}
                />
            </TouchableOpacity>

            {showPicker && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={date}
                    mode={'date'}
                    is24Hour={true}
                    display="default"
                    onChange={onDateChange}
                />
            )}

            <Text style={MyStyles.m}>Job type</Text>
            <Picker selectedValue={jobData.job_type} onValueChange={(itemValue) => updateState('job_type', itemValue)}>
                <Picker.Item label="Full-time" value="full_time" />
                <Picker.Item label="Part-time" value="part_time" />
                <Picker.Item label="Remote" value="remote" />
            </Picker>

            <Button
                loading={loading}
                disabled={loading}
                onPress={handleFormSubmit}
                mode="contained"
                style={MyStyles.m}
            >
                {submitButtonText}
            </Button>
        </ScrollView>
    );
};

export default JobForm;