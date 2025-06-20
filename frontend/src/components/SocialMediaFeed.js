import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import './../styles/SocialMedia.css';

const SocialMediaFeed = () => {
    const [mockSocialMedia, setMockSocialMedia] = useState([]);
    const [loadingMockSocial, setLoadingMockSocial] = useState(false);
    const [twitterResults, setTwitterResults] = useState([]);
    const [twitterQuery, setTwitterQuery] = useState('');
    const [twitterLoading, setTwitterLoading] = useState(false);
    const [twitterError, setTwitterError] = useState(null);

    useEffect(() => {
        const fetchFeeds = async () => {
            setLoadingMockSocial(true);
            const mockData = await api.fetchMockSocialMedia();
            setMockSocialMedia(mockData);
            setLoadingMockSocial(false);
        };
        fetchFeeds();
    }, []);

    const handleTwitterSearch = async (e) => {
        e.preventDefault();
        setTwitterLoading(true);
        setTwitterError(null);
        const res = await fetch(`http://localhost:4000/twitter/search?q=${encodeURIComponent(twitterQuery)}`);
        const data = await res.json();
        if (data.error) setTwitterError(data.error);
        setTwitterResults((data.data || []).map(post => ({ ...post, priority: post.text && (post.text.toLowerCase().includes('urgent') || post.text.toLowerCase().includes('sos')) })));
        setTwitterLoading(false);
    };

    return (
        <div className="social-media-section">
            <h2>Social Media Feeds</h2>
            <div className="feeds-container">
                <div className="feed">
                    <h3>Twitter Search</h3>
                    <form onSubmit={handleTwitterSearch}>
                        <input
                            type="text"
                            value={twitterQuery}
                            onChange={(e) => setTwitterQuery(e.target.value)}
                            placeholder="Search Twitter..."
                        />
                        <button type="submit" disabled={twitterLoading}>
                            {twitterLoading ? 'Searching...' : 'Search'}
                        </button>
                    </form>
                    {twitterError && (
                        <div className="error-message">
                            {twitterError.includes('429')
                                ? 'You have reached the Twitter search limit. Please wait a few minutes and try again.'
                                : twitterError}
                        </div>
                    )}
                    {twitterLoading && <p>Loading...</p>}
                    <div className="post-list">
                        {twitterResults.map((post, index) => (
                            <div key={`twitter-${index}`} className={`post ${post.priority ? 'priority-post priority-anim' : ''}`}>
                                {post.priority && <strong className="priority-label">[PRIORITY]</strong>}
                                <p>{post.text}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="feed">
                    <h3>Mock Social Media Feed</h3>
                    {loadingMockSocial && <p>Loading...</p>}
                    <div className="post-list">
                        {mockSocialMedia.map(post => (
                            <div key={post.id} className={`post ${post.priority ? 'priority-post priority-anim' : ''}`}>
                                {post.priority && <strong className="priority-label">[PRIORITY]</strong>}
                                <p>{post.content}</p>
                                <span>- {post.author}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SocialMediaFeed; 