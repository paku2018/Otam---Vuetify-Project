import { defineStore } from "pinia";
import { ref } from "vue";
import type { Ref } from "vue";
import type { Charity } from "@/views/menu/charities/add-charity/data/types";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
  where,
  query,
  orderBy,
} from "firebase/firestore";
import { db, storage } from "@/firebase";
import {
  ref as refStorage,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

interface CharityStorageData {
  displayPicture: File | undefined;
  coverPicture: File | undefined;
  documents: File | undefined;
}

interface CharityToModify {
  accountsDate: string;
  address: string;
  beneficiary: string;
  category: string;
  charityNumber: string;
  charityURL: string;
  collectedDonation: string;
  contactEmail: string;
  contactName: string;
  contactNumber: string;
  country: string;
  facebook: string;
  feed: string;
  instagram: string;
  lastChecked: string;
  longDescription: string;
  operation: string;
  registrationDate: string;
  removeDate: string;
  shortDescription: string;
  startDate: string;
  status: string;
  subtitle: string;
  title: string;
  totalIncome: string;
  totalSpent: string;
  twitter: string;
  URL: string;
  user: string;
  website: string;
  youtube: string;
}

export const useCharities = defineStore("charities", () => {
  // <-- Variables -->
  const charities: Ref<Charity[]> = ref([]);

  // <-- Actions -->
  const getCharities = async () => {
    const q = query(
      collection(db, "charities"),
      where("private", "==", false),
      orderBy("title")
    );
    try {
      const querySnapshot = await getDocs(q);
      const firebaseCharities: Charity[] = [];
      querySnapshot.forEach((doc) => {
        const charity = {
          accountsDate: doc.data().accountsDate,
          address: doc.data().address,
          beneficiary: doc.data().beneficiary,
          category: doc.data().category,
          charityNumber: doc.data().charityNumber,
          charityURL: doc.data().charityURL,
          collectedDonation: doc.data().collectedDonation,
          contactEmail: doc.data().contactEmail,
          contactName: doc.data().contactName,
          contactNumber: doc.data().contactNumber,
          country: doc.data().country,
          coverPicture: doc.data().coverPicture,
          createdBy: doc.data().createdBy,
          displayPicture: doc.data().displayPicture,
          documents: doc.data().documents,
          facebook: doc.data().facebook,
          feed: doc.data().feed,
          id: doc.id,
          instagram: doc.data().instagram,
          isFeatured: doc.data().isFeatured,
          isVerified: doc.data().isVerified,
          lastChecked: doc.data().lastChecked,
          likes: doc.data().likes,
          longDescription: doc.data().longDescription,
          operation: doc.data().operation,
          private: doc.data().private,
          registrationDate: doc.data().registrationDate,
          removeDate: doc.data().removeDate,
          shortDescription: doc.data().shortDescription,
          startDate: doc.data().startDate,
          status: doc.data().status,
          subtitle: doc.data().subtitle,
          title: doc.data().title,
          totalIncome: doc.data().totalIncome,
          totalSpent: doc.data().totalSpent,
          twitter: doc.data().twitter,
          URL: doc.data().URL,
          user: doc.data().user,
          views: doc.data().views,
          website: doc.data().website,
          youtube: doc.data().youtube,
        };
        firebaseCharities.push(charity);
      });
      charities.value = [...firebaseCharities];
    } catch (e) {
      console.error(e);
    }
  };

  const addCharity = async (newCharity: Charity, data: CharityStorageData) => {
    return await addDoc(collection(db, "charities"), newCharity)
      .then(async (docRef) => {
        const documentId = docRef.id;
        const isSuccess = await addCharityStorageData(data, documentId);
        return isSuccess;
      })
      .catch((error) => {
        console.error(error);
        return false;
      });
  };

  const addCharityStorageData = async (
    data: CharityStorageData,
    id: string
  ) => {
    const isSuccess = ref(false);
    const coverPictureRef = refStorage(
      storage,
      `charities/${id}/cover_picture/cover_picture.jpeg`
    );
    const displayPictureRef = refStorage(
      storage,
      `charities/${id}/display_picture/display_picture.jpeg`
    );
    const documentsRef = refStorage(
      storage,
      `charities/${id}/documents/document.pdf`
    );
    try {
      if (data.coverPicture != undefined) {
        await uploadBytes(coverPictureRef, data.coverPicture as Blob).then(
          async () => {
            await getDownloadURL(coverPictureRef).then(async (url) => {
              await updateDoc(doc(db, "charities", `${id}`), {
                coverPicture: url,
              });
            });
            isSuccess.value = true;
          }
        );
      }
      if (data.displayPicture != undefined) {
        await uploadBytes(displayPictureRef, data.displayPicture as Blob).then(
          async () => {
            await getDownloadURL(displayPictureRef).then(async (url) => {
              await updateDoc(doc(db, "charities", `${id}`), {
                displayPicture: url,
              });
            });
            isSuccess.value = true;
          }
        );
      }
      if (data.documents != undefined) {
        await uploadBytes(documentsRef, data.documents as Blob).then(
          async () => {
            await getDownloadURL(documentsRef).then(async (url) => {
              await updateDoc(doc(db, "charities", `${id}`), {
                documents: url,
              });
            });
            isSuccess.value = true;
          }
        );
      }
      return true;
    } catch (e) {
      console.error(e);
      isSuccess.value = false;
      return isSuccess;
    }
  };

  const handleFeaturedCharity = async (id: string) => {
    const selectedCharity = charities.value.filter(
      (charity) => charity.id === id
    )[0];
    if (selectedCharity.isFeatured) {
      await updateDoc(doc(db, "charities", id), {
        isFeatured: false,
      });
    } else {
      await updateDoc(doc(db, "charities", id), {
        isFeatured: true,
      });
    }
  };

  const deleteCharity = async (
    id: string,
    displayPicture: string,
    coverPicture: string,
    documents: string
  ) => {
    await deleteDoc(doc(db, "charities", id));
    await deleteCharityStorage(id, displayPicture, coverPicture, documents);
  };

  const deleteCharityStorage = async (
    id: string,
    displayPicture: string,
    coverPicture: string,
    documents: string
  ) => {
    const isSuccess = ref(false);
    const coverPictureRef = refStorage(
      storage,
      `charities/${id}/cover_picture/cover_picture.jpeg`
    );
    const displayPictureRef = refStorage(
      storage,
      `charities/${id}/display_picture/display_picture.jpeg`
    );
    const documentsRef = refStorage(
      storage,
      `charities/${id}/documents/document.pdf`
    );
    if (coverPicture) {
      deleteObject(coverPictureRef)
        .then(() => {
          isSuccess.value = true;
        })
        .catch((error) => {
          isSuccess.value = false;
          console.error(error);
        });
    }
    if (displayPicture) {
      deleteObject(displayPictureRef)
        .then(() => {
          isSuccess.value = true;
        })
        .catch((error) => {
          isSuccess.value = false;
          console.error(error);
        });
    }
    if (documents) {
      deleteObject(documentsRef)
        .then(() => {
          isSuccess.value = true;
        })
        .catch((error) => {
          isSuccess.value = false;
          console.error(error);
        });
    }

    return isSuccess.value;
  };

  const handleVerify = async (id: string) => {
    const selectedCharity = charities.value.filter(
      (charity) => charity.id === id
    )[0];
    if (selectedCharity.isVerified) {
      await updateDoc(doc(db, "charities", id), {
        isVerified: false,
      });
    } else {
      await updateDoc(doc(db, "charities", id), {
        isVerified: true,
      });
    }
  };

  const updateCharityDetails = async (
    id: string,
    modifiedCharity: CharityToModify
  ) => {
    const isSuccess = ref(false);
    return await updateDoc(doc(db, "charities", id), {
      accountsDate: modifiedCharity.accountsDate,
      address: modifiedCharity.address,
      beneficiary: modifiedCharity.beneficiary,
      category: modifiedCharity.category,
      charityNumber: modifiedCharity.charityNumber,
      charityURL: modifiedCharity.charityURL,
      collectedDonation: modifiedCharity.collectedDonation,
      contactEmail: modifiedCharity.contactEmail,
      contactName: modifiedCharity.contactName,
      contactNumber: modifiedCharity.contactNumber,
      country: modifiedCharity.country,
      facebook: modifiedCharity.facebook,
      feed: modifiedCharity.feed,
      instagram: modifiedCharity.instagram,
      lastChecked: modifiedCharity.lastChecked,
      longDescription: modifiedCharity.longDescription,
      operation: modifiedCharity.operation,
      registrationDate: modifiedCharity.registrationDate,
      removeDate: modifiedCharity.removeDate,
      shortDescription: modifiedCharity.shortDescription,
      startDate: modifiedCharity.startDate,
      status: modifiedCharity.status,
      subtitle: modifiedCharity.subtitle,
      title: modifiedCharity.title,
      totalIncome: modifiedCharity.totalIncome,
      totalSpent: modifiedCharity.totalSpent,
      twitter: modifiedCharity.twitter,
      URL: modifiedCharity.URL,
      user: modifiedCharity.user,
      website: modifiedCharity.website,
      youtube: modifiedCharity.youtube,
    })
      .then(() => {
        isSuccess.value = true;
        return isSuccess.value;
      })
      .catch((e) => {
        console.error(e);
        isSuccess.value = false;
        return isSuccess.value;
      });
  };

  const handleLogout = () => {
    return (charities.value = []);
  };

  return {
    addCharity,
    addCharityStorageData,
    charities,
    deleteCharity,
    getCharities,
    handleFeaturedCharity,
    handleLogout,
    handleVerify,
    updateCharityDetails,
  };
});
