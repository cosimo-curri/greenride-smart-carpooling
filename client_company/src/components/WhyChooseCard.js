function WhyChooseCard(props) {
    return (
        <div className="why-choose-card">
            <img src={ props.image } alt="Why Choose Card Logo" />
            <h3>{ props.title }</h3>
            <p>{ props.description }</p>
        </div>
    );
}

export default WhyChooseCard;