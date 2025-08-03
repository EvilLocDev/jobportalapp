import MyStyles from "../../styles/MyStyles";
import {useEffect, useState} from "react";
import Apis, {endpoints} from "../../configs/Apis";
import {Chip, List, Searchbar} from "react-native-paper";
import {FlatList, ActivityIndicator, Image, TouchableOpacity, Text, View} from "react-native";

const Home = () => {
    const [companies, setCompanies] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [q, setQ] = useState();
    const [page, setPage] = useState(1);
    const [companyId, setCompanyId] = useState(null)

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

    const loadMore = () => {
        if (!loading && page > 0)
            setPage(page + 1);
    }

    return (
        <View style={[MyStyles.container, MyStyles.p]}>
            <Text style={MyStyles.subject}>COMPANY LIST</Text>

            <View style={[MyStyles.row, MyStyles.wrap]}>
                <TouchableOpacity onPress={() => setCompanyId(null)}>
                    <Chip icon="label" style={MyStyles.m}>All</Chip>
                </TouchableOpacity>

                {companies.map(c => <TouchableOpacity key={c.id} onPress={() => setCompanyId(c.id)}>
                    <Chip icon="label" style={MyStyles.m}>{c.name}</Chip>
                </TouchableOpacity>)}
            </View>

            <Searchbar placeholder="Find jobs..." value={q} onChangeText={setQ} />

            <FlatList onEndReached={loadMore} ListFooterComponent={loading && <ActivityIndicator size={30}/>}
                      data={jobs} renderItem={({item}) => <List.Item title={item.title} description={item.created_date} left={() => <Image style={MyStyles.avatar} source={{uri: item.company.logo}}/>
                      }/>
            }/>
        </View>
    );
}

export default Home;