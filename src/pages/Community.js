import CommunityPosts from "../components/posts";
import Navigation from "../layout/Navigation";

function Community(){

    return(
        
        <div className="row bg-light">
            <Navigation/>
            <div className="col-3"/>
            <div className="col-6 p-5">

            <div className="card text-white bg-secondary mb-5">
                    <div className="card-header">Create Post</div>
                    <div className="card-body">
                        <p className="card-text">Write Post</p>
                    </div>
            </div>


            <CommunityPosts/>
            <CommunityPosts/>
            <CommunityPosts/>
            <CommunityPosts/>
            <CommunityPosts/>
            <CommunityPosts/>


            </div>
            <div className="col-3"/>

        </div>

    );
}

export default Community;