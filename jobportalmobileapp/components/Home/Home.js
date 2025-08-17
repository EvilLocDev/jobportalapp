import { useContext, useEffect, useState } from "react";
import { FlatList, ActivityIndicator, Image, TouchableOpacity, SafeAreaView, View } from "react-native";
import { Chip, List, Searchbar, Icon } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import MyStyles from "../../styles/MyStyles";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import { MyUserContext} from "../../configs/Contexts";

const Home = () => {
    const [companies, setCompanies] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [q, setQ] = useState(null);
    const [page, setPage] = useState(1);
    const [companyId, setCompanyId] = useState(null);
    const nav = useNavigation();
    const user = useContext(MyUserContext);

    const loadCompanies = async () => {
        try {
            let res = await Apis.get(endpoints['companies']);
            setCompanies(res.data);
        } catch (ex) {
            console.error(ex);
        }
    }

    const loadJobs = async () => {
        if (page <= 0) return; // Nếu không còn trang thì không load

        let url = `${endpoints['jobs']}?page=${page}`;
        if (q) url += `&q=${q}`;
        if (companyId) url += `&company_id=${companyId}`;

        console.log("Loading jobs from URL:", url);

        try {
            setLoading(true);
            let res = await Apis.get(url);

            if (page === 1) {
                // Nếu là trang đầu tiên, thay thế toàn bộ danh sách cũ
                setJobs(res.data.results);
            } else {
                // Nếu là trang tiếp theo, nối vào danh sách hiện tại
                // Sử dụng callback để tránh stale state và lọc các item đã tồn tại
                setJobs(prevJobs => [
                    ...prevJobs,
                    ...res.data.results.filter(
                        newJob => !prevJobs.some(prevJob => prevJob.id === newJob.id)
                    )
                ]);
            }

            if (res.data.next === null)
                setPage(0); // Đặt page = 0 để không load thêm nữa

        } catch (ex) {
            if (ex.response && ex.response.status === 404) {
                setPage(0); // Dừng lại nếu API báo 404 (hết dữ liệu)
            }
            console.error(ex);
        } finally {
            setLoading(false);
        }
    }

    const loadMore = () => {
        if (!loading && page > 0) {
            console.log("loadmore");
            setPage(prev => prev + 1);
        }
    };

    useEffect(() => {
        loadCompanies();
    }, []);

    useEffect(() => {
        let timer = setTimeout(() => {
            setPage(1); // Đặt lại trang về 1
        }, 500);

        return () => clearTimeout(timer);
    }, [q, companyId]);

    useEffect(() => {
        if (page > 0) {
            loadJobs();
        } else {
            // Nếu page = 0 và là do filter, có thể danh sách kết quả rỗng
            if (jobs.length > 0 && page === 0) {
                 // Không làm gì cả để giữ lại kết quả trang cuối
            } else {
                 setJobs([]);
            }
        }
    }, [page]);

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

            <Searchbar placeholder="Find jobs..." value={q} onChangeText={t => setQ(t)} />

            <FlatList
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={() => loading ? <ActivityIndicator size={30}/> : null}
                data={jobs}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <List.Item
                        title={item.title}
                        description={item.created_date}
                        left={() => (
                            <TouchableOpacity onPress={() => nav.navigate('job-details', { 'jobId': item.id })}>
                                <Image style={MyStyles.avatar} source={{ uri: item.company.logo }} />
                            </TouchableOpacity>

                        )}
                    />
                )}
            />
        </SafeAreaView>
    );
}

export default Home;