import MyStyles from "../../styles/MyStyles";
import {useEffect, useState} from "react";
import Apis, {endpoints} from "../../configs/Apis";
import {Chip, List, Searchbar} from "react-native-paper";
import {FlatList, ActivityIndicator, Image, TouchableOpacity, SafeAreaView, View} from "react-native";
import {useNavigation} from "@react-navigation/native";

const Home = () => {
    const [companies, setCompanies] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [q, setQ] = useState();
    const [page, setPage] = useState(1);
    const [companyId, setCompanyId] = useState(null);
    const nav = useNavigation();

    const loadCompanies = async () => {
        let res = await Apis.get(endpoints['companies']);
        setCompanies(res.data);
    }

    const loadJobs = async () => {
        if (page > 0) {
            let url = `${endpoints['jobs']}?page=${page}`;

            if (q) {
                url = `${url}&q=${q}`
            }

            if (companyId) {
                url = `${url}&company_id=${companyId}`;
            }

            try {
                setLoading(true);
                let res = await Apis.get(url);
                setJobs([...jobs, ...res.data.results]);

                if (res.data.next === null)
                    setPage(0);
            } catch (ex) {
                console.error(ex);
            } finally {
                setLoading(false)
            }
        }
    }

    useEffect(() => {
        loadCompanies();
    }, []);

    useEffect(() => {
        let timer = setTimeout(() => {
            loadJobs();
        }, 500);

        return () => clearTimeout(timer);
    }, [q, companyId, page]);

    // Fix later
    // useEffect(() => {
    //     setPage(1);
    //     setJobs([]);
    // }, [q, companyId]);

    const loadMore = () => {
        if (!loading && page > 0)
            setPage(page + 1);
    }

    return (
        <SafeAreaView style={[MyStyles.container, MyStyles.p]}>

            <View style={[MyStyles.row, MyStyles.wrap]}>
                <TouchableOpacity onPress={() => setCompanyId(null)}>
                    <Chip icon="label" style={MyStyles.m}>All</Chip>
                </TouchableOpacity>

                {companies.map(c => <TouchableOpacity key={`Company${c.id}`} onPress={() => setCompanyId(c.id)}>
                    <Chip icon="label" style={MyStyles.m}>{c.name}</Chip>
                </TouchableOpacity>)}
            </View>

            <Searchbar placeholder="Find jobs..." value={q} onChangeText={setQ} />

            <FlatList onEndReached={loadMore} ListFooterComponent={loading && <ActivityIndicator size={30}/>}
                      data={jobs} renderItem={({item}) => <List.Item key={`Job${item.id}`} title={item.title}
                                                                     description={item.created_date}
                                                                     left={() => <TouchableOpacity onPress={() => nav.navigate('applications', {'jobId': item.id})}>
                                                                         <Image style={MyStyles.avatar} source={{uri: item.company.logo}}/>
                                                                     </TouchableOpacity>

                      }/>
            }/>
        </SafeAreaView>
    );
}

export default Home;