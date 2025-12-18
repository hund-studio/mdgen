import { Fragment, type FC } from "react";
import styles from "./carousel.module.scss";
import { tools } from "../../styles/modules";
import img1 from "./img/1.svg";
import img2 from "./img/2.svg";
import img3 from "./img/3.svg";
import img4 from "./img/4.svg";

const data = [
  { img: img1, caption: <Fragment>📁 Pick the folder containing your markdown files.</Fragment> },
  { img: img2, caption: <Fragment>📁 Open it and choose.</Fragment> },
  { img: img3, caption: <Fragment>🔍Navigate your files through html preview.</Fragment> },
  {
    img: img4,
    caption: <Fragment>📄 Export all markdown files in the folder as html files.</Fragment>,
  },
];

const Carousel: FC<{ onClose: VoidFunction }> = ({ onClose }) => {
  return (
    <div className={`${styles["wrapper"]}`}>
      <div className={`${styles["inner"]}`}>
        <div>
          <button
            className={`${tools["button"]} ${tools["button--thin"]} ${tools["button--dark"]}`}
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className={`${styles["stage"]}`}>
          {data.map((entry, index) => (
            <div key={index} className={`${styles["card"]}`}>
              <img src={entry.img} />
              <div className={`${styles["card-caption"]}`}>
                <div className={`${tools["small"]}`}>
                  <span>{entry.caption}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Carousel;
