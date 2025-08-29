import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollView: {
        flex: 1,
        padding: 16,
    },
    card: {
        marginBottom: 16,
        borderRadius: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        backgroundColor: '#ffffff',
    },
    cardCover: {
        height: 200,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    logoContainer: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    companyLogo: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: '#e9ecef',
    },
    cardContent: {
        padding: 20,
    },
    jobTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 12,
    },
    jobLocation: {
        fontSize: 16,
        color: '#6c757d',
        marginBottom: 8,
        fontStyle: 'italic',
    },
    jobSalary: {
        fontSize: 16,
        fontWeight: '600',
        color: '#28a745',
        marginBottom: 12,
    },
    descriptionContainer: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
    },
    descriptionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#495057',
        marginBottom: 12,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    companyInfo: {
        marginBottom: 12,
    },
    companyName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#495057',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 12,
    },
    tag: {
        backgroundColor: '#007bff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginHorizontal: 4,
        marginVertical: 2,
    },
    tagText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '500',
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 16,
        margin: 12,
        borderRadius: 10,
        maxHeight: '85%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12,
    },
    fitScoreText: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#007bff',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 15,
        marginBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 5,
    },
    summaryText: {
        fontSize: 15,
        lineHeight: 22,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    chip: {
        margin: 4,
        backgroundColor: '#e0f7fa',
    },
    chipMissing: {
        margin: 4,
        backgroundColor: '#ffebee',
    }
});