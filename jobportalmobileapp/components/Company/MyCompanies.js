import React, { useState, useContext, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { Text, Card, ActivityIndicator, Button, Chip } from 'react-native-paper';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { MyUserContext } from '../../configs/Contexts';
import { authApis, endpoints } from '../../configs/Apis';
import MyStyles from '../../styles/MyStyles';

const MyCompanies = () => {
    const user = useContext(MyUserContext);
    const nav = useNavigation();
    const isFocused = useIsFocused();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadCompanies = async () => {
        setLoading(true);
        try {
            const res = await authApis(user.access_token).get(endpoints['my-companies']);
            setCompanies(res.data);
        } catch (ex) {
            console.log('Error: ', ex);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        if (isFocused) {
            loadCompanies();
        }
    }, [isFocused]);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'approved':
                return { backgroundColor: '#28a745', color: '#fff' };
            case 'pending':
                return { backgroundColor: '#ffc107', color: '#000' };
            case 'rejected':
                return { backgroundColor: '#dc3545', color: '#fff' };
            default:
                return {};
        }
    };

    return (
        <View style={[MyStyles.container, { flex: 1 }]}>
            <Button
                icon="plus"
                mode="contained"
                onPress={() => nav.navigate('CreateCompany')}
                style={MyStyles.m}
            >
                Create New Company
            </Button>
            
            {loading ? <ActivityIndicator style={MyStyles.margin} /> : (
                <ScrollView refreshControl={<RefreshControl onRefresh={loadCompanies} />}>
                    {companies.length === 0 ? (
                        <Text style={MyStyles.m}>You have no company</Text>
                    ) : (
                        companies.map(c => (
                            <TouchableOpacity key={c.id} onPress={() => nav.navigate('CompanyJobManagement', {'companyId': c.id, 'companyName': c.name})}>
                                <Card style={MyStyles.m}>
                                    <Card.Title
                                        title={c.name}
                                        titleStyle={{fontWeight: 'bold'}}
                                        subtitle={`Trạng thái: ${c.status}`}
                                        left={(props) => <Image {...props} source={{ uri: c.logo }} style={{width: 40, height: 40, borderRadius: 5}} />}
                                        right={() => <Chip style={[{marginRight: 15}, getStatusStyle(c.status)]} textStyle={{color: getStatusStyle(c.status).color}}>{c.status}</Chip>}
                                    />
                                </Card>
                            </TouchableOpacity>
                        ))
                    )}
                </ScrollView>
            )}
        </View>
    );
};

export default MyCompanies;