import PropTypes from "prop-types";
import { testimonials } from "./testimonialData";

const TestimonialCard = ({ name, className, avatarBorder }) => {
  const testimonial = testimonials.find(
    (testimonial) => testimonial.name.toLowerCase() === name.toLowerCase(),
  );
  return (
    <section
      className={`rounded-lg px-8 pb-8 pt-6 ${className} tracking-[0.0225rem]`}
      key={testimonial.name}
    >
      <div className="flex items-center gap-x-4">
        <img
          src={testimonial.image}
          alt="avatar"
          className={`${avatarBorder} rounded-full`}
          width={30}
          height={30}
        />
        <div>
          <h2 className="leading-[1.220]">{testimonial.name}</h2>
          <p className="text-[.70rem] opacity-40">{testimonial.status}</p>
        </div>
      </div>
      <h3 className="my-4 text-[1.220rem] leading-tight">
        {testimonial.tagline}
      </h3>
      <p className="text-xs leading-normal opacity-60">
        {testimonial.testimony}
      </p>
    </section>
  );
};

TestimonialCard.propTypes = {
  name: PropTypes.string,
  className: PropTypes.string,
  avatarBorder: PropTypes.string,
};

export default TestimonialCard;